"""Local read-only credentials and fixed-origin member asset policy."""
from datetime import datetime, timezone
import os
from pathlib import Path
import re
import stat
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler

MEMBER_ORIGIN = 'https://www.fred-fu.com'
ASSET_PATH = re.compile(r'/api/visual-library/assets/[0-9a-f]{64}\.[a-z0-9]+')
DEFAULT_TOKEN_FILE = Path.home() / '.config/fredtalk/visual-library-token'


def trusted_asset_url(url):
    parsed = urlsplit(url)
    if (parsed.scheme != 'https' or parsed.netloc != 'www.fred-fu.com' or
            parsed.username or parsed.password or parsed.query or parsed.fragment or
            not ASSET_PATH.fullmatch(parsed.path)):
        raise ValueError('Member assets require the fixed FredTalk HTTPS asset origin and full hash path.')
    return url


class TrustedAssetRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, newurl):
        trusted_asset_url(newurl)
        return super().redirect_request(request, response, code, message, headers, newurl)


def requires_membership(record):
    if record.get('access') != 'members':
        return False
    public_at = record.get('earlyAccess', {}).get('publicAt')
    if not public_at:
        return True
    try:
        instant = datetime.fromisoformat(public_at.replace('Z', '+00:00'))
        if instant.tzinfo is None:
            return True
        return datetime.now(timezone.utc) < instant
    except (TypeError, ValueError):
        return True


def read_token(root, token_file=None):
    value = os.environ.get('FREDTALK_MEMBER_TOKEN')
    if value is None:
        path = Path(token_file) if token_file else DEFAULT_TOKEN_FILE
        if not path.exists():
            return None
        if path.is_symlink() or path.resolve().is_relative_to(Path(root).resolve()):
            raise ValueError('Member token file must be a private regular file outside the repository.')
        descriptor = os.open(path, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0))
        try:
            info = os.fstat(descriptor)
            if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o600 or info.st_uid != os.getuid():
                raise ValueError('Member token file must belong to this user with mode 0600.')
            if info.st_size > 4096:
                raise ValueError('Invalid member token file.')
            with os.fdopen(descriptor, 'r', encoding='utf-8', closefd=False) as handle:
                value = handle.read(4096)
        finally:
            os.close(descriptor)
    value = value.strip()
    if not re.fullmatch(r'ftvl_[A-Za-z0-9_-]+', value):
        raise ValueError('Invalid member token format; create a read-only Agent token on the FredTalk website.')
    return value
