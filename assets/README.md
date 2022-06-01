# Information about asset creation

## Creating High Quality GIF animations

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

## SVG assets

Assets containing the word `workspace` e.g. `readme.workspace.svg` are the master
document from which all other assets with similar names e.g. `readme.fpm.svg` are
derived.

> Note:
> **The derived `SVG`s are converted to Paths in order to avoid any
> potential problems with missing fonts.**

Normal workflow:

1. Edit the `.workspace.svg` file
2. Copy the final asset to a separate `SVG` file.
3. Adjust the `SVG` file size to just the size of the asset.
4. Convert the final Object to Path.
5. The final asset is ready to use.
