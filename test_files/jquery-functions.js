jQuery(function($) {
    // Your code using failsafe $ alias here...

    $("ul.sf-menu").superfish({
        delay:       500,
        animation: { height: 'show' },
        speed: 1,
        autoArrows: true,
        dropShadows: false
    });

  if (typeof (Sys) !== 'undefined' && Sys.Browser.agent === Sys.Browser.InternetExplorer && Sys.Browser.version === 10) {
    var self = Sys.WebForms.PageRequestManager.getInstance();
    Sys.UI.DomEvent.removeHandler(self._form, "click", self._onFormElementClickHandler);
    self._onFormElementClick = function (b) {
      var a = b.target;
      if (a.disabled) return;
      this._postBackSettings = this._getPostBackSettings(a, a.name);
      if (a.name) if (a.tagName === "INPUT") {
        var c = a.type;
        if (c === "submit") this._additionalInput = a.name + "=" + encodeURIComponent(a.value);
        else if (c === "image") {
          var d = b.offsetX,
              e = b.offsetY;
          this._additionalInput = a.name + ".x=" + Math.floor(d) + "&" + a.name + ".y=" + Math.floor(e);
        }
      } else if (a.tagName === "BUTTON" && a.name.length !== 0 && a.type === "submit") this._additionalInput = a.name + "=" + encodeURIComponent(a.value)
    };
    Sys.UI.DomEvent.addHandler(self._form, "click", Function.createDelegate(self, self._onFormElementClick));
  }
});
