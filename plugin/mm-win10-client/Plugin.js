/*******************************************************************************
The MIT License (MIT)

Copyright (c) 2016 Matchbox Mobile Limited <info@matchboxmobile.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*******************************************************************************/

function GetInfo(infoObject) {
    return new Metadata().injectPluginInformationInto(infoObject);
}

function RunPlugin(profileData) {
    // first load all dependencies files
    Dependencies.load();
    // make sure logging is enabled/disabled
    Utils.logger.setEnabled(true);
    // and then run the engine to produce source code
    return new PluginProcessor(profileData).run();
}

// Global depoendency manager object - defines other JS source code files to
// load and provides functionality to load them into current context.
var Dependencies = {
    dependencies : [
        "Enums.js",
        "Utils.js",
        "tmpl.js",
        "PluginProcessor.js"
    ],
    load : function() {
        var global_eval = eval;
        for (i = 0; i < this.dependencies.length; ++i) {
            var script = FileManager.ReadFile(this.dependencies[i]);
            global_eval(script);
        }
    }
};

// =============================================================================
// Metadata class - providing the information about the plugin itself
// =============================================================================
// Constructor for Metadata objects
function Metadata() {
    this.Name = "Windows 10 UWP Client";
    this.description = "Generates C# source code to work with given profile";
    this.author = "Matchbox Mobile Limited";
    this.versionDescriptor = {
        major: 1,
        minor: 0,
        patch: 0,
        prefix: null,
        suffix: ""
    };
    this.clientMode = true;
    this.includeDefaultServices = false;
    this.currentDate = new Date();
    this.releaseDate = new Date(Date.UTC(2016, 2, 16)); // months are 0-indexed!
    this.link = "http://matchboxmobile.com/blog/bds-plugin-dev";
    this.contactEmail = "info@matchboxmobile.com";
    this.copyrightYears = "2016";
    this.namespace = "ble.wrappers";
    this.namespaceSuffix = ".ble.wrappers";
}
Metadata.prototype.updateFor = function(profile) {
    if(profile.CustomNameSpace == null || profile.CustomNameSpace == "") return this;
    this.namespace = profile.CustomNameSpace + this.getNamespaceSuffix();
    return this;
}
Metadata.prototype.getName = function() { return this.Name; }
Metadata.prototype.getDescription = function() { return this.description; }
Metadata.prototype.getAuthor = function() { return this.author; }
Metadata.prototype.getLink = function() { return this.link; }
Metadata.prototype.getContactEmail = function() { return this.contactEmail; }
Metadata.prototype.getCopyrightYears = function() { return this.copyrightYears; }
Metadata.prototype.getVersion = function() { return this.versionDescriptor; }
Metadata.prototype.getGenerationDate = function() { return this.currentDate; }
Metadata.prototype.getPluginReleaseDate = function() { return this.releaseDate; }
Metadata.prototype.getNamespace = function() { return this.namespace; }
Metadata.prototype.getNamespaceSuffix = function() { return this.namespaceSuffix; }
Metadata.prototype.getVersionDescription = function() {
    var version = this.getVersion();
    var prefix = "";
    var suffix = "";
    if (version.prefix !== null && version.prefix !== "") prefix = version.prefix + " ";
    if (version.suffix !== null && version.suffix !== "") suffix = " " + version.suffix;

    return prefix + version.major + "." + version.minor + "." + version.patch + suffix;
}
Metadata.prototype.isClient = function() { return this.clientMode; }
Metadata.prototype.shouldIncludeDefaultServices = function() { return this.includeDefaultServices; }
Metadata.prototype.injectPluginInformationInto = function(target) {
    target.Name = this.getName();
    target.Description = this.getDescription();
    target.Author = this.getAuthor();
    target.Version = this.getVersionDescription();
    target.IsClient = this.isClient();
    target.IncludeDefaultServices = this.shouldIncludeDefaultServices();
    return target;
};
