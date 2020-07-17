# On Page Track Buttons

The original version of this plugin, as well as the official Harvest plugin, inject a button right on the page where you track your time.
While this is convenient it provided some issues:
 
 * Broke a lot on updates of the target page
 * Conflicted with security features of browser and target pages (e.g. [content security policies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src))

So we decided to instead have a button in the browser UI which would extract the context from the current tab:

![Example](./images/modalImage.png)