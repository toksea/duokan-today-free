var duokan = require('./duokan'),
    moment = require('moment'),
    fs = require('fs'),
    util = require('util'),
    historyFile = './history.json',
    history,
    date = new Date(),
    today = moment(),
	// today = moment("20111031", "YYYYMMDD"),
    todayMD = today.format('MMDD'),
    todayYMD = today.format('YYYYMMDD');

try {
    history = require(historyFile);
}
catch (e) {
    history = {};
}

if (history[todayYMD]) {
    // process.exit();
    rss(history);
}

duokan.today_free(function(book) {

    // console.log(book);

    book.feedItem = {
        title:  todayMD + ' ' + book.title,
        description: util.format(
			'<ul>' +
                '<li>下载链接: <a href="%s">%s</a></li>' +
                '<li>多看评分:%s</li>' +
                '<li>豆瓣评分:%s</li>' +
                '<li>豆瓣地址: <a href="%s">%s</a></li>' +
                '</ul>',
            book.url, book.url,
            book.duokan_rating_value + '(' + book.duokan_rating_count + ')',
            book.douban_rating_value + '(' + book.douban_rating_count + ')',
            book.douban_url, book.douban_url),
        url: book.url,
        guid: date.toDateString(),
        date: date
    };

    // console.log(book);
    history[todayYMD] = book;

    fs.writeFileSync(historyFile, JSON.stringify(history, null, '  '));

    rss(history);
});



function rss(history) {
    var RSS = require('rss');

    var now = new Date();

    /* lets create an rss feed */
    var feed = new RSS({
        title: '多看今日免费',
        description: '多看今天限时免费的书',
        site_url: 'http://duokan.com',
        pubDate: now,
        ttl: '1440' // 24 * 60 min, 每天一变
    });

    /* loop over data and add to feed */
    for (var key in history) {
        var item = history[key];
        feed.item(item.feedItem);
    }

    // cache the xml to send to clients
    var xml = feed.xml("  ");
    require('fs').writeFileSync('feed.xml', xml);

}
