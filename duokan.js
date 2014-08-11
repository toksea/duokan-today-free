var request = require('request'),
    cheerio = require('cheerio'),
    duokan_home = 'http://www.duokan.com';

module.exports = {
    today_free: function(cb) {
        /** 10. 查找今日限免的书 */
        request(duokan_home, function(error, response, body) {
            if (error) throw error;

            if (response.statusCode != 200) throw new Error('Request duokan home failed');

            var $ = cheerio.load(body),
                free_url = $('img[alt="限时免费"]').parent().attr('href');

            if (free_url.indexOf(duokan_home) < 0) {
                free_url = duokan_home + free_url;
            }

            // console.log('loading ' + free_url);

            // free_url = 'http://www.duokan.com/book/53260';
            /** 20. 在多看获取本书信息 */
            request(free_url, function(error, response, body) {
                if (error) throw error;

                if (response.statusCode != 200) throw new Error('Request duokan free book failed');

                var $ = cheerio.load(body),
                    book = {
                        title: $('.m-bookdata h3').text(),
                        url: response.request.uri.href,
                        duokan_rating_value: $('.m-bookdata em[itemprop="ratingValue"]').text(),
                        duokan_rating_count: $('.g-mnc span[itemprop="reviewCount"]').text(),
                        isbn: $('.g-mnc span[itemprop="isbn"]').text()
                    };

                // console.log(book);

                var douban_url = 'http://book.douban.com/isbn/' + book.isbn;

                /** 30. 在豆瓣获取更多信息 */
                request(douban_url, function(error, response, body) {
                    if (error) throw error;

                    if (response.statusCode == 200) {

                        var $ = cheerio.load(body);

                        book.douban_url = response.request.uri.href;
                        book.douban_rating_value = $('strong[property="v:average"]').text().trim();
                        book.douban_rating_count = $('span[property="v:votes"]').text().trim();

                        // console.log(book);
                    }

                    cb(book);
                });
            });
        });
    }
};
