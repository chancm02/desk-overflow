"""Build silent caption-led marketing videos from browser-rendered brand frames."""
from pathlib import Path
import sys, subprocess, json
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'private/media-python'))
import imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe()
cache=ROOT/'private/media-cache';cache.mkdir(parents=True,exist_ok=True)
projects={'01-missed-call-coverage':[('hook',6),('capture',8),('price',7),('cta',6)],'02-how-it-works':[('faq',7),('calendar',8),('launch',7),('cta',6)],'03-pricing-and-setup':[('price',9),('launch',7),('cta',6)]}
outputs=[]
for name,scenes in projects.items():
 segments=[]
 for i,(scene,duration) in enumerate(scenes):
  dest=cache/(name+'-'+str(i)+'.mp4')
  vf="scale=1080:1920,zoompan=z='min(1.025,1+0.0001*on)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30,fade=t=in:st=0:d=0.22,fade=t=out:st="+str(duration-.22)+":d=0.22,format=yuv420p"
  cmd=[ff,'-y','-hide_banner','-loglevel','error','-loop','1','-framerate','30','-i',str(ROOT/'marketing/images'/('vertical-'+scene+'.jpg')),'-f','lavfi','-i','anullsrc=channel_layout=stereo:sample_rate=48000','-vf',vf,'-t',str(duration),'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-shortest','-movflags','+faststart',str(dest)]
  subprocess.run(cmd,check=True);segments.append(dest)
 concat=cache/(name+'.txt');concat.write_text(''.join("file '"+str(p).replace('\\','/')+"'\n" for p in segments))
 out=ROOT/'marketing/videos'/(name+'.mp4')
 subprocess.run([ff,'-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(out)],check=True)
 outputs.append({'file':out.name,'seconds':sum(d for _,d in scenes),'width':1080,'height':1920,'fps':30,'audio':'silent AAC; no music or recorded caller audio','bytes':out.stat().st_size})
 print('BUILT',out.name,flush=True)
(ROOT/'marketing/video-manifest.json').write_text(json.dumps(outputs,indent=2)+'\n')
