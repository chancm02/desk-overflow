"""One API and durable worker on the same persistent-volume host.
Terminate the whole deployment if either child exits; host restarts it.
"""
import os,signal,subprocess,sys,time
from .app import runtime_configured

def main():
    port=int(os.getenv('PORT','8080'))
    if not 1<=port<=65535:raise ValueError('Invalid PORT')
    children=[]
    def stop(*_):
        for child in children:
            if child.poll() is None:child.terminate()
        for child in children:
            try:child.wait(timeout=10)
            except subprocess.TimeoutExpired:child.kill();child.wait()
    signal.signal(signal.SIGTERM,lambda *_:sys.exit(0))
    signal.signal(signal.SIGINT,lambda *_:sys.exit(0))
    try:
        children.append(subprocess.Popen([sys.executable,'-m','gunicorn','backend.enrollment.app:application','--bind',f'0.0.0.0:{port}','--workers','2','--timeout','60']))
        if runtime_configured():children.append(subprocess.Popen([sys.executable,'-m','backend.enrollment.worker']))
        while True:
            for child in children:
                if child.poll() is not None:return child.returncode or 1
            time.sleep(.5)
    finally:stop()
if __name__=='__main__':sys.exit(main())
