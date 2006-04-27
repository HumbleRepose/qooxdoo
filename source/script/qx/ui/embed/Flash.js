/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(flash)

************************************************************************ */

/*!
  Original non qooxdoo Version by Geoff Stearns
    Flash detection and embed - http://blog.deconcept.com/flashobject/
    FlashObject is (c) 2005 Geoff Stearns and is released under the MIT License
    http://www.opensource.org/licenses/mit-license.php

  Modified for qooxdoo by Sebastian Werner
    Based on version 1.2.3
    Relicensed under LGPL in assent of Geoff Stearns
*/

qx.OO.defineClass("qx.ui.embed.FlashEmbed", qx.ui.basic.Terminator, 
function(vSource, vVersion)
{
  qx.ui.basic.Terminator.call(this);

  // Use background handling of qx.ui.core.Widget instead
  this._params = {};
  this._variables = {};

  if(qx.util.Validation.isValidString(vSource)) {
    this.setSource(vSource);
  };

  this.setVersion(qx.util.Validation.isValidString(vVersion) ? vVersion : qx.ui.embed.FlashEmbed.MINREQUIRED);
});

qx.OO.addProperty({ name : "source", type : qx.Const.TYPEOF_STRING });
qx.OO.addProperty({ name : "version" });

qx.OO.addProperty({ name : "enableExpressInstall", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : false });
qx.OO.addProperty({ name : "enableDetection", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true });
qx.OO.addProperty({ name : "redirectUrl", type : qx.Const.TYPEOF_STRING });

qx.OO.addProperty({ name : "quality", type : qx.Const.TYPEOF_STRING, impl : "param", defaultValue : "high", possibleValues : [ "low", "autolow", "autohigh", "medium", "high", "best" ] });
qx.OO.addProperty({ name : "scale", type : qx.Const.TYPEOF_STRING, impl : "param", defaultValue : "showall", possibleValues : [ "showall", "noborder", "excactfit", "noscale" ] });
qx.OO.addProperty({ name : "wmode", type : qx.Const.TYPEOF_STRING, impl : "param", defaultValue : "", possibleValues : [ "window", "opaque", "transparent" ] });
qx.OO.addProperty({ name : "play", type : qx.Const.TYPEOF_BOOLEAN, impl : "param", defaultValue : true });
qx.OO.addProperty({ name : "loop", type : qx.Const.TYPEOF_BOOLEAN, impl : "param", defaultValue : true });
qx.OO.addProperty({ name : "menu", type : qx.Const.TYPEOF_BOOLEAN, impl : "param", defaultValue : true });

qx.ui.embed.FlashEmbed.EXPRESSINSTALL = [6,0,65];
qx.ui.embed.FlashEmbed.MINREQUIRED = "1";
qx.ui.embed.FlashEmbed.PLAYERVERSION = null;
qx.ui.embed.FlashEmbed.PLUGINKEY = "Shockwave Flash";
qx.ui.embed.FlashEmbed.ACTIVEXKEY = "ShockwaveFlash.ShockwaveFlash";





/*
---------------------------------------------------------------------------
  PLAYER VERSION CACHE
---------------------------------------------------------------------------
*/

qx.ui.embed.FlashEmbed.getPlayerVersion = function()
{
  if (qx.ui.embed.FlashEmbed.PLAYERVERSION != null) {
    return qx.ui.embed.FlashEmbed.PLAYERVERSION;
  };

  var vPlayerVersion = new qx.types.Version(0,0,0);

  if(navigator.plugins && navigator.mimeTypes.length)
  {
    var x = navigator.plugins[qx.ui.embed.FlashEmbed.PLUGINKEY];

    if(x && x.description) {
      vPlayerVersion = new qx.types.Version(x.description.replace(/([a-z]|[A-Z]|\s)+/, '').replace(/(\s+r|\s+b[0-9]+)/, '.'));
    };
  }
  else if (window.ActiveXObject)
  {
    try {
      var axo = new ActiveXObject(qx.ui.embed.FlashEmbed.ACTIVEXKEY);
       vPlayerVersion = new qx.types.Version(axo.GetVariable("$version").split(qx.constant.Core.SPACE)[1].split(qx.constant.Core.COMMA));
    }
    catch (e) {};
  };

  return qx.ui.embed.FlashEmbed.PLAYERVERSION = vPlayerVersion;
};






/*
---------------------------------------------------------------------------
  BASICS
---------------------------------------------------------------------------
*/

qx.Proto._version = null;
qx.Proto._source = "";

qx.Proto._applyElementData = function(el)
{
  qx.ui.basic.Terminator.prototype._applyElementData.call(this, el);

  // Check for ExpressInstall
  this._expressInstall = false;

  if (this.getEnableExpressInstall())
  {
    // check to see if we need to do an express install
    var expressInstallReqVer = new qx.types.Version(qx.ui.embed.FlashEmbed.EXPRESSINSTALL);
    var installedVer = qx.ui.embed.FlashEmbed.getPlayerVersion();

    if (installedVer.versionIsValid(expressInstallReqVer) && !installedVer.versionIsValid(this._version)) {
      this._expressInstall = true;
    };
  };

  // this.debug("ExpressInstall Enabled: " + this._expressInstall);

  // Apply HTML
  if(!this.getEnableDetection() || this._expressInstall || qx.ui.embed.FlashEmbed.getPlayerVersion().versionIsValid(this._version))
  {
    el.innerHTML = this.generateHTML();
  }
  else
  {
    var redir = this.getRedirectUrl();

    if(redir != qx.constant.Core.EMPTY) {
      document.location.replace(redir);
    };
  };
};





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifySource = function(propValue, propOldValue, propName)
{
  this._source = qx.util.Validation.isValidString(propValue) ? qx.manager.object.ImageManager.buildUri(propValue) : qx.constant.Core.EMPTY;
  return true;
};

qx.Proto._modifyVersion = function(propValue, propOldValue, propData)
{
  if (this._version)
  {
    this._version.dispose();
    this._version = null;
  };

  if (qx.util.Validation.isValidString(propValue)) {
    this._version = new qx.types.Version(propValue);
  };

  return true;
};

qx.Proto._modifyParam = function(propValue, propOldValue, propData)
{
  this.setParam(propData.name, propValue.toString());
  return true;
};





/*
---------------------------------------------------------------------------
  OVERWRITE BACKGROUND COLOR HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._modifyBackgroundColor = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue)
  {
    this._applyBackgroundColor(propValue.getHex());
    propValue.add(this);
  }
  else
  {
    this._resetBackgroundColor();
  };

  return true;
};

qx.Proto._applyBackgroundColor = function(vNewValue) {
  this.setParam("bgcolor", vNewValue);
};




/*
---------------------------------------------------------------------------
  PARAMS
---------------------------------------------------------------------------
*/

qx.Proto.setParam = function(name, value){
  this._params[name] = value;
};

qx.Proto.getParam = function(name){
  return this._params[name];
};

qx.Proto.getParams = function() {
  return this._params;
};





/*
---------------------------------------------------------------------------
  VARIABLES
---------------------------------------------------------------------------
*/

qx.Proto.setVariable = function(name, value){
  this._variables[name] = value;
};

qx.Proto.getVariable = function(name){
  return this._variables[name];
};

qx.Proto.getVariables = function(){
  return this._variables;
};





/*
---------------------------------------------------------------------------
  HTML UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.generateParamTags = function()
{
  var vParams = this.getParams();
  var vParamTags = [];

  for (var vKey in vParams)
  {
    vParamTags.push("<param name='");
    vParamTags.push(vKey);
    vParamTags.push("' value='");
    vParamTags.push(vParams[vKey]);
    vParamTags.push("'/>");
  };

  return vParamTags.join(qx.constant.Core.EMPTY);
};

qx.Proto.getVariablePairs = function()
{
  var variables = this.getVariables();
  var variablePairs = [];

  for (var key in variables) {
    variablePairs.push(key + qx.constant.Core.EQUAL + variables[key]);
  };

  return variablePairs.join(qx.constant.Core.AMPERSAND);
};






/*
---------------------------------------------------------------------------
  HTML GENERATOR
---------------------------------------------------------------------------
*/

// Netscape Plugin Architecture
if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length)
{
  qx.Proto.generateHTML = function()
  {
    var html = [];

    // Express Install Handling
    if (this._expressInstall)
    {
      document.title = document.title.slice(0, 47) + ' - Flash Player Installation';

      this.addVariable('MMredirectURL', escape(window.location));
      this.addVariable('MMdoctitle', document.title);
      this.addVariable('MMplayerType', 'PlugIn');
    };

    html.push("<embed type='application/x-shockwave-flash' width='100%' height='100%' src='");
    html.push(this._source);
    html.push(qx.constant.Core.SINGLEQUOTE);

    var params = this.getParams();

    for (var key in params)
    {
      html.push(qx.constant.Core.SPACE);
      html.push(key);
      html.push(qx.constant.Core.EQUAL);
      html.push(qx.constant.Core.SINGLEQUOTE);
      html.push(params[key]);
      html.push(qx.constant.Core.SINGLEQUOTE);
    };

    var pairs = this.getVariablePairs();

    if (pairs.length > 0)
    {
      html.push(qx.constant.Core.SPACE);
      html.push("flashvars");
      html.push(qx.constant.Core.EQUAL);
      html.push(qx.constant.Core.SINGLEQUOTE);
      html.push(pairs);
      html.push(qx.constant.Core.SINGLEQUOTE);
    };

    html.push("></embed>");

    return html.join(qx.constant.Core.EMPTY);
  };
}

// Internet Explorer ActiveX Architecture
else
{
  qx.Proto.generateHTML = function()
  {
    var html = [];

    // Express Install Handling
    if (this._expressInstall)
    {
      document.title = document.title.slice(0, 47) + ' - Flash Player Installation';

      this.addVariable("MMredirectURL", escape(window.location));
      this.addVariable("MMdoctitle", document.title);
      this.addVariable("MMplayerType", "ActiveX");
    };

    html.push("<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='100%' height='100%'>");
    html.push("<param name='movie' value='");
    html.push(this._source);
    html.push("'/>");

    var tags = this.generateParamTags();

    if(tags.length > 0) {
      html.push(tags);
    };

    var pairs = this.getVariablePairs();

    if(pairs.length > 0)
    {
      html.push("<param name='flashvars' value='");
      html.push(pairs);
      html.push("'/>");
    };

    html.push("</object>");

    return html.join(qx.constant.Core.EMPTY);
  };
};






/*
---------------------------------------------------------------------------
  METHODS TO GIVE THE LAYOUTERS INFORMATIONS
---------------------------------------------------------------------------
*/

qx.Proto._isWidthEssential = qx.util.Return.returnTrue;
qx.Proto._isHeightEssential = qx.util.Return.returnTrue;




/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS
---------------------------------------------------------------------------
*/

qx.Proto._computePreferredInnerWidth = qx.util.Return.returnZero;
qx.Proto._computePreferredInnerHeight = qx.util.Return.returnZero;





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  delete this._source;
  delete this._params;
  delete this._variables;

  if (this._version)
  {
    this._version.dispose();
    this._version = null;
  };

  qx.ui.core.Widget.prototype.dispose.call(this);
};
