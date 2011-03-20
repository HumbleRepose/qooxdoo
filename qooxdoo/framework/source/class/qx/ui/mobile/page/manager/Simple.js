/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/* ************************************************************************

#ignore(BackButton)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.page.manager.Simple",
{
  extend : qx.core.Object,


  construct : function(root)
  {
    this.base(arguments);
    this.__pages = {};
    this._setRoot(root || qx.core.Init.getApplication().getRoot());

    this.__registerEventListeners();
  },

  events :
  {
    add : "qx.event.type.Data",
    remove : "qx.event.type.Data"
  },


  members :
  {
    __pages : null,
    __currentPage : null,
    __root : null,

    /**
     * @lint ignoreUndefined(BackButton)
     */
    __registerEventListeners : function()
    {
      if (qx.bom.client.Feature.PHONEGAP && qx.bom.client.System.ANDROID)
      {
        this.__backButtonHandler = qx.lang.Function.bind(this._onBackButton, this);
        this.__menuButtonHandler = qx.lang.Function.bind(this._onMenuButton, this);
        BackButton.override();
        // TODO: Move this to an PhoneGap / Android Event Handler
        qx.bom.Event.addNativeListener(document, "backKeyDown", this.__backButtonHandler);
        qx.bom.Event.addNativeListener(document, "menuKeyDown", this.__menuButtonHandler);
      }
    },


    __unregisteEventListeners : function()
    {
      if (qx.bom.client.Feature.PHONEGAP && qx.bom.client.System.ANDROID)
      {
        qx.bom.Event.removeNativeListener(document, "backKeyDown", this.__backButtonHandler);
        qx.bom.Event.removeNativeListener(document, "menuKeyDown", this.__menuButtonHandler);
      }
    },


    _onBackButton : function()
    {
      if (qx.bom.client.Feature.PHONEGAP && qx.bom.client.System.ANDROID)
      {
        var exit = true;
        if (this.__currentPage) {
          exit = this.__currentPage.back();
        }
        if (exit) {
          BackButton.exitApp();
        }
      }
    },


    _onMenuButton : function()
    {
      if (qx.bom.client.Feature.PHONEGAP && qx.bom.client.System.ANDROID)
      {
        if (this.__currentPage) {
          this.__currentPage.menu();
        }
      }
    },


    add : function(page)
    {
      this.__pages[page.getId()] = page;
      this.fireDataEvent("add", page);
    },


    remove : function(id)
    {
      var page = this.getPage(id);
      if (this.__currentPage == page) {
        throw new Error("Current page with the Id " + page.getId() + " can not be removed");
      }
      delete this.__pages[page.getId()];
      this.fireDataEvent("remove", page);
    },


    show : function(page)
    {
      var currentPage = this.__currentPage;
      if (currentPage == page) {
        return;
      }

      if (qx.core.Variant.isSet("qx.mobile.nativescroll", "on"))
      {
        // Scroll the page up
        scrollTo(0,0);
      }

      page.initialize();
      page.start();
      this.__root.add(page);


      if (currentPage)
      {
        currentPage.stop();
        this.__removeFocusFromInputFields();
        this._removeCurrentPage();
      }

      this._setCurrentPage(page);
    },


    _removeCurrentPage : function()
    {
      this.__root.remove(this.__currentPage);
    },


    _getRoot : function()
    {
      return this.__root;
    },


    _setRoot : function(root)
    {
      this.__root = root;
    },


    getCurrentPage : function()
    {
      return this.__currentPage;
    },


    _setCurrentPage : function(page)
    {
      this.__currentPage = page;
    },


    getPage : function(id) {
      return this.__pages[id];
    },


    __removeFocusFromInputFields : function()
    {
      // Remove focus from input elements, so that the keyboard and the mouse cursor is hidden
      var elements = document.getElementsByTagName("input");
      for (var i=0, length = elements.length; i < length; i++) {
       elements[i].blur();
      }
    }
  },


  destruct : function()
  {
    this.__unregisteEventListeners();
    this.__history = this.__pages = this.__currentPage = this.__root = null;
  }
});