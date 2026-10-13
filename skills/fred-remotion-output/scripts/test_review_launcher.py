import socket
import unittest
from serve_review_app import ensure_port


class LauncherTests(unittest.TestCase):
    def test_live_listener_is_not_reusable(self):
        with socket.socket() as listener:
            listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            listener.bind(('127.0.0.1', 0))
            listener.listen()
            with self.assertRaises(OSError):
                ensure_port(listener.getsockname()[1])

    def test_closed_connection_does_not_block_restart(self):
        with socket.socket() as listener:
            listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            listener.bind(('127.0.0.1', 0))
            port = listener.getsockname()[1]
            listener.listen()
            with socket.create_connection(('127.0.0.1', port)) as client:
                accepted, _ = listener.accept()
                accepted.close()
                client.recv(1)
        ensure_port(port)


if __name__ == '__main__':
    unittest.main()
