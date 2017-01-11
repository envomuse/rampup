var postConfig = {
  plugins: []
};

var path = require('path');
var fs = require('fs');
var marked = require('marked');

var HtmlwebpackPlugin = require('html-webpack-plugin');
var ROOT_PATH = path.resolve(__dirname);
var DOCSPATH = path.join(ROOT_PATH, '../docs');

// Add markdown docs
function addMarkdownDocHtmls (argument) {
  // body...
  var exposeDoc = {
    'welcome': 'welcome.md'
  };

  for (var name in exposeDoc) {
    var htmlPlugin = new HtmlwebpackPlugin({
      title: name,
      filename: `docs/${name}.html`,
      templateContent: () => {
        var content = marked(fs.readFileSync(path.join(DOCSPATH, exposeDoc[name]), 'utf8' ));
        return `<!DOCTYPE html><html>
            <head>
              <meta charset="UTF-8">
            </head>
            <body>
              ${content}
            </body>
          </html>`;
        },
      inject: 'head',
      chunks: ['ioPackage']
    });

    postConfig.plugins.push(htmlPlugin);
  };
}
addMarkdownDocHtmls();

// proxy devServer
var TARGET = process.env.npm_lifecycle_event;
if(TARGET === 'start' || !TARGET) {
  postConfig
  .devServer =  {
    proxy : {
      '/u/*': {
          target: 'http://localhost:3000',
          secure: false,
          bypass: function(req, res, proxyOptions) {
            if (req.headers.accept.indexOf('html') !== -1) {
                console.log('Skipping proxy for browser request.');
                return false;
            }
          },
      }
    }
  };
}

// export server rendering template
function exportSwigTemplate (argument) {
  var htmlPlugin = new HtmlwebpackPlugin({
    title: 'HomeDashboard',
    // filename: `./../../server/views/tpls/app.html`,
    filename: `app.html`,
    templateContent: () => {
      return `<!DOCTYPE html><html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
          </head>
          <body>
            <script>
            window.__INITIAL_STATE__ = {{__INITIAL_STATE__ | json | safe}}
            </script>
          </body>
        </html>`;
      },
    inject: 'body',
    chunks: ['vendor', 'ioPackage', 'app']
  });
  postConfig.plugins.push(htmlPlugin);
}
exportSwigTemplate();

// export publicPath
postConfig.output = {
  publicPath: "/static/"
}

module.exports = postConfig;