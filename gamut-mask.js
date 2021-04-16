
window.addEventListener("load", function()
{
    let Array2d = function(width, height, type)
    {
        type = type == undefined ? Int32Array : type;
        this.array = new type(width * height);
        this.width = () => width;
        this.height = () => height;
        this.index = (x, y) => x + y * width;
        this.set = function(x, y, value)
        {
            this.array[this.index(x, y)] = value;
        };
        this.get = function(x, y)
        {
            return this.array[this.index(x, y)];
        };
        this.add = function(x, y, value)
        {
            this.array[this.index(x, y)] += value;
        };
    };

    let display_size = 500;
    let display_canvas = document.createElement("canvas");
    let img = document.createElement("img");

    // Ranges: [255, 255, 255] -> [360, 100, 100]
    let rgbToHsv = function(r, g, b)
    {
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b);
        let cmax = Math.max(r, g, b);
        let mdiff = cmax - cmin;
        let hue =
            ( (cmax == cmin) ? 0
            : (cmax == r) ? 60 * ((g - b) / mdiff)
            : (cmax == g) ? 60 * ((b - r) / mdiff + 2)
            : (cmax == b) ? 60 * ((r - g) / mdiff + 4)
            : 0);
        if (hue < 0) hue += 360;
        let sat = (cmax <= 0 ? 0 : (mdiff / cmax));
        return [hue, 100 * sat, 100 * cmax].map(Math.trunc);
    };

    // Ranges: [360, 100, 100] -> [255, 255, 255]
    let hsvToRgb = function(h, s, v)
    {
        h /= 60;
        s /= 100;
        v /= 100;
        let c = v * s;
        let x = c * (1 - Math.abs((h % 2) - 1));
        let m = v - c;
        let hh = Math.trunc(h);
        let rgb =
            ( (hh == 0) ? [c, x, 0]
            : (hh == 1) ? [x, c, 0]
            : (hh == 2) ? [0, c, x]
            : (hh == 3) ? [0, x, c]
            : (hh == 4) ? [x, 0, c]
            : (hh == 5) ? [c, 0, x]
            :             [0, 0, 0]);
        return rgb.map(x => Math.trunc(255 * (x + m)));
    };

    let makeHistogram = function(data)
    {
        let histo = new Array2d(360, 100);
        for (let i = 0; i < data.length; i += 4)
        {
            if (data[i + 3] == 0)
                continue;
            let [h,s,_] = rgbToHsv(data[i + 0], data[i + 1], data[i + 2]);
            histo.add(h, s, 1);
        }
        return histo;
    };

    let radians = (degrees) => degrees * Math.PI / 180;

    let renderHistogram = function(canvas, histo)
    {
        canvas.width = display_size;
        canvas.height = display_size;
        center_x = canvas.width / 2;
        center_y = canvas.height / 2;
        let context = canvas.getContext("2d");
        context.beginPath();
        context.fillStyle = "rgb(127, 127, 127)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        context.fillStyle = "black";
        context.ellipse(center_x, center_y, 200, 200, 0, 0, Math.PI * 2);
        context.stroke();

        let dotAt = function(hue, sat, val)
        {
            context.setTransform();
            context.translate(center_x, center_y);
            context.rotate(radians(hue));
            context.translate(sat * 2, 0);
            let [r,g,b] = hsvToRgb(hue, sat, val);
            context.fillStyle = `rgb(${r}, ${g}, ${b})`;
            context.beginPath();
            let rad = 2;
            context.ellipse(0, 0, rad, rad, 0, 0, Math.PI * 2);
            context.fill();
        };

        for (let sat = 0; sat < histo.height(); ++sat)
        {
            for (let hue = 0; hue < histo.width(); ++hue)
            {
                dotAt(hue, sat, 25);
            }
        }

        for (let sat = 0; sat < histo.height(); ++sat)
        {
            for (let hue = 0; hue < histo.width(); ++hue)
            {
                let count = histo.get(hue, sat);
                if (count == 0)
                    continue;
                dotAt(hue, sat, 100);
            }
        }
    };

    let processImage = function(data)
    {
        let canvas = document.createElement("canvas");
        canvas.width = data.target.width;
        canvas.height = data.target.height;
        let context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        let histo = makeHistogram(context.getImageData(0, 0, canvas.width, canvas.height).data);
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
                    let temp_img = new Image();
                    temp_img.onload = processImage;
                    temp_img.src = event.target.result;
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

    display_canvas.style.height = display_size;
    document.body.append(display_canvas);

    img.style.height = display_size;
    document.body.append(img);
});