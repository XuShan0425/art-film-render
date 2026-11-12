from PIL import Image
import glob
files=sorted(glob.glob('out/ref/*.jpg'))
cols,rows,cell=6,4,420
wall=Image.new('RGB',(cols*cell,rows*cell),(17,17,17))
for i,f in enumerate(files[:cols*rows]):
    im=Image.open(f).convert('RGB')
    im.thumbnail((cell,cell))
    wall.paste(im,((i%cols)*cell+(cell-im.width)//2,(i//cols)*cell+(cell-im.height)//2))
wall.save('out/ref/wall.jpg',quality=88)
print('ok',len(files))
