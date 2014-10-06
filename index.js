var cheerio     = require('cheerio'),
    co          = require('co'),
    fs          = require('fs'),
    request     = require('request');

var indexUrl = 'http://zenpencils.com';

co(function* () {
    try {
        var result = yield getBody(indexUrl);
        if (result) {
            var $ = cheerio.load(result);
            var getImageTasks = [];

            $('.chosen-select option').each(function () {
                getImageTasks.push(getImage($(this).val()));
            });

            yield getImageTasks;
            console.log('All done');
        }
    } catch(e) {
        throw new Error(e);
    }

})();

// Returns the content of the URL
function getBody (url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

// For every link, it downloads the image
function getImage(url) {
    return new Promise(function (resolve, reject) {
        var imgName = null;
        return getBody(url)
            .then(function (result) {
                var $ = cheerio.load(result);

                if ($('#comic img').length) {
                    var path = $('#comic img').attr('src');
                    imgName = path.split('/').pop();
                    request(path)
                        .pipe(fs.createWriteStream('posters/' +imgName))
                        .on('close', resolve(true))
                        .on('error', resolve(null));
                } else {
                    resolve(null);
                }

            })
            .catch(function (err) {
                reject(err);
            });
    });
}