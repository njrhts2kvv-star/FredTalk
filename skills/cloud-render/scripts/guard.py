#!/usr/bin/env python3
"""Linux memory guard. Only kills descendants of the command launched here."""
import argparse,json,os,signal,subprocess,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--report',default='guard-report.json');p.add_argument('--min-available-gib',type=float,default=8);p.add_argument('command',nargs=argparse.REMAINDER);a=p.parse_args();cmd=a.command[1:] if a.command[:1]==['--'] else a.command
if not cmd:p.error('Missing command after --')
if not Path('/proc/meminfo').exists():p.error('This guard requires Linux /proc')
proc=subprocess.Popen(cmd,start_new_session=True,stdin=subprocess.DEVNULL);samples=[];reason=None
try:
 while proc.poll() is None:
  mem={l.split(':')[0]:int(l.split()[1]) for l in Path('/proc/meminfo').read_text().splitlines()};available=mem['MemAvailable']/1048576
  samples.append({'time':time.time(),'availableGiB':available,'usedGiB':(mem['MemTotal']-mem['MemAvailable'])/1048576})
  if available<a.min_available_gib:reason='Memory reserve reached';break
  time.sleep(.5)
except KeyboardInterrupt:reason='User interrupted'
finally:
 if reason:
  # Stop the root first so no new workers are started while collecting descendants.
  try:os.kill(proc.pid,signal.SIGSTOP)
  except ProcessLookupError:pass
  pairs=[tuple(map(int,l.split())) for l in subprocess.check_output(['ps','-eo','pid,ppid'],text=True).splitlines()[1:]];ids={proc.pid}
  while True:
   more=ids|{pid for pid,parent in pairs if parent in ids}
   if more==ids:break
   ids=more
  for sig in [signal.SIGSTOP,signal.SIGKILL]:
   for pid in ids:
    try:os.kill(pid,sig)
    except ProcessLookupError:pass
 code=proc.wait();Path(a.report).write_text(json.dumps({'exitCode':code,'stopReason':reason,'samples':samples},indent=2))
raise SystemExit(1 if reason else code)
