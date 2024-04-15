// const restful = (req, res, handlers) => {
//   //
//   // This shortcut function responses with HTTP 405
//   // to the requests having a method that does not
//   // have corresponding request handler. For example
//   // if a resource allows only GET and POST requests
//   // then PUT, DELETE, etc requests will be responsed
//   // with the 405. HTTP 405 is required to have Allow
//   // header set to a list of allowed methods so in
//   // this case the response has "Allow: GET, POST" in
//   // its headers [1].
//   //
//   // Example usage
//   //
//   //     A handler that allows only GET requests and returns
//   //
//   //     exports.myrestfulhandler = function (req, res) {
//   //         restful(req, res, {
//   //             get: function (req, res) {
//   //                 res.send(200, 'Hello restful world.');
//   //             }
//   //         });
//   //     }
//   //
//   // References
//   //
//   //     [1] RFC-2616, 10.4.6 405 Method Not Allowed
//   //     https://tools.ietf.org/html/rfc2616#page-66
//   //
//   //     [2] Express.js request method
//   //     http://expressjs.com/api.html#req.route
//   //
//   const method = (req.method || '').toLowerCase(); // [2]
//   if (!(method in handlers)) {
//     res.set('Allow', Object.keys(handlers).join(', ').toUpperCase());
//     res.sendStatus(405);
//   } else {
//     handlers[method](req, res);
//   }
// };

// module.exports = restful;

const restful = (req, res, handlers) => {
    const method = (req.method || '').toLowerCase();
    if (!(method in handlers)) {
        res.set('Allow', Object.keys(handlers).join(', ').toUpperCase());
        res.sendStatus(405);
    } else {
        const handler = handlers[method];
        if (handler.length <= 2) {
            // Standard call for handlers not expecting next
            handler(req, res);
        } else {
            // Use the handler that expects a next function for error handling
            handler(req, res, (err) => {
                if (err) {
                    // Log the error or handle it accordingly
                    console.error(err);
                    res.status(500).json({ data: [], error: 'Error processing request' });
                }
            });
        }
    }
};

module.exports = restful;
