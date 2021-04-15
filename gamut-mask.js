
window.addEventListener("load", function ()
{
    let display_canvas = document.createElement("canvas");
    display_canvas.style.width = "100%";
    display_canvas.style.float = "left";

    let img = document.createElement("img");
    img.style.width = "100%";
    img.style.float = "left";

    document.body.append(display_canvas);
    document.body.append(img);

    let rgbToHsv = function(r, g, b)
    {
        let cmin = Math.min(r, g, b);
        let cmax = Math.max(r, g, b);
        let mdiff = cmax - cmin;
        let hue = c &&
            ( (cmin == r) ? (g - b) / mdiff
            : (cmin == g) ? (b - r) / mdiff + 2
            : (cmin == b) ? (r - g) / mdiff + 4
            : 0);
        hue = 60 * (hue < 0 ? h + 6 : h);
        let sat = cmax <= 0 ? 0 : mdiff / cmax;
        return [hue, sat, cmax];
    };

    let makeHistogram = function(data, width, height)
    {
        for (let y = 0; y < height; ++y)
        {
            for (let x = 0; x < width; ++x)
            {
                
            }
        }
    };

    let processImage = function (data)
    {
        img.src = data;
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        let histo = makeHistogram(context.getImageData(0, 0, img.width, img.height).data, img.width, img.height);
    };

    document.body.ondrop = function (event)
    {
        event.preventDefault();
        for (let item of event.dataTransfer.items)
        {
            if (item.type.startsWith("image/"))
            {
                let reader = new FileReader();
                reader.onload = function (event)
                {
                    processImage(event.target.result);
                };
                reader.readAsDataURL(item.getAsFile());
                break;
            }
        }
    };

    document.body.ondragover = function(event)
    {
        event.preventDefault();
    };
});