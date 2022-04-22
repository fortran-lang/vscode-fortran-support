# Creating High Quality GIF animations

Two scripts have been included inside the `tools` folder for ease of use, but the following instructions should allow for more custom-made GIFs

## Steps

1. Use a screen capturing software to record the animation
2. Use `ffmpeg` to convert the animation into `.png` frames

   > **Note:** this is also the step to add any additional editing to the original animation
   > like padded boarders

   ```sh
        ffmpeg -i animation.mp4 frame%05d.png
   ```

   or adding additional options like a border

   ```sh
       ffmpeg -i animation.mp4 -vf "pad=width=900:height=550:x=5:y=5:color=734f96" frame%05d.png
   ```

3. Download [Gifski](https://gif.ski) to merge the frames into a `.gif` and run

   > **Note:** gifski produces the most color-accurate GIFs

   ```sh
       gifski --width 888 -o output.gif frame*.png
   ```

Alternatively to step **3.** one can use `ffmpeg`, but the final animation will be
considerably less sharp and artifact-free.

```sh
ffmpeg -i animation.mp4 -vf palettegen palette.png
ffmpeg -i animation.mp4 -i palette.png -filter_complex "fps=15,scale=-1:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif
```
