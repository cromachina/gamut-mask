
window.addEventListener("load", function()
{
    let display_canvas = document.createElement("canvas");
    let img = document.createElement("img");

    let rgbToHsv = function(r, g, b)
    {
        let cmin = Math.min(r, g, b);
        let cmax = Math.max(r, g, b);
        let mdiff = cmax - cmin;
        let hue = cmax &&
            ( (cmin == r) ? (g - b) / mdiff
            : (cmin == g) ? (b - r) / mdiff + 2
            : (cmin == b) ? (r - g) / mdiff + 4
            : 0);
        hue = 60 * (hue < 0 ? hue + 6 : hue);
        let sat = 100 * (cmax <= 0 ? 0 : mdiff / cmax);
        return [hue, sat, cmax].map(Math.trunc);
    };

    let makeHistogram = function(data, width, height, hue_buckets, sat_buckets, val_buckets)
    {
        let hue = new Uint16Array(hue_buckets);
        let sat = new Uint8Array(sat_buckets);
        let val = new Uint8Array(val_buckets);
        for (let y = 0; y < height; ++y)
        {
            for (let x = 0; x < width; ++x)
            {
                let offset = x + y * width;
                if (data[offset + 3] == 0)
                    continue;
                let [h,s,v] = rgbToHsv(data[offset + 0], data[offset + 1], data[offset + 2]);
                hue[Math.trunc(hue_buckets * (h / 360))] += 1;
                sat[Math.trunc(sat_buckets * (s / 100))] += 1;
                val[Math.trunc(val_buckets * (v / 255))] += 1;
            }
        }
        return {hue:hue, sat:sat, val:val};
    };

    let renderHistogram = function(canvas, histo)
    {
        let context = canvas.getContext("2d");
    };

    let processImage = function(data)
    {
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        let histo = makeHistogram(context.getImageData(0, 0, img.width, img.height).data, img.width, img.height, 360, 25, 100);
        renderHistogram(display_canvas, histo);
    };

    document.body.ondrop = function(event)
    {
        event.preventDefault();
        for (let item of event.dataTransfer.items)
        {
            if (item.type.startsWith("image/"))
            {
                let reader = new FileReader();
                reader.onload = function(event)
                {
                    img.src = event.target.result;
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

    display_canvas.style.width = "100%";
    display_canvas.style.float = "left";
    document.body.append(display_canvas);

    img.style.width = "100%";
    img.style.float = "left";
    img.onload = processImage;
    document.body.append(img);
});