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

// =============================================================================
// PluginProcessor class - generates C# code for handling given profile in
//                         Windows 10 UWP applications.
// =============================================================================

// Constructor for processor objects
function PluginProcessor(profile) {
    this.profile = profile;
    this.metadata = new Metadata();
    this.peripheralName = profile.ProfileName;
    this.paths = {
        base : "Base",
        parsers: "Parsers",
        peripheral : Utils.convertStringIntoProperCsharpName(profile.ProfileName)
    };
    this.paths.templates = {
        readme : "README.txt",
        license : "LICENSE.txt",
        srcBleBase : "Base_BleBase.cs",
        srcBleCharacteristic : "Base_BleCharacteristic.cs",
        srcBleService : "Base_BleService.cs",
        srcBleDevice : "Base_BleDevice.cs",
        srcBleSpecificDevice : "Target_BleDevice.cs",
        srcBleSpecificService : "Target_BleService.cs",
        srcBleValueParser : "Base_BleValueParser.cs"
    };
    this.paths.exampleParsers = {
        heartRate : "Parsers_HeartRateMeasurementParser.cs",
        stringParser : "Parsers_StringParser.cs",
        batteryLevelParser : "Parsers_BatteryLevelParser.cs"
    }
    this.paths.output = {
        readme : "README.txt",
        license : "LICENSE.txt"
    }
}
PluginProcessor.prototype.getProfile = function() { return this.profile; }
PluginProcessor.prototype.getMetadata = function() { return this.metadata; }
PluginProcessor.prototype.generateDirectories = function() {
    Utils.logger.d("Generating output sub directories ...").intent();
    FileManager.CreateFolder(this.paths.base);
    Utils.logger.d(this.paths.base + " (base/general sources) directory created");

    FileManager.CreateFolder(this.paths.parsers);
    Utils.logger.d(this.paths.parsers + " (example adopted parsers) directory created");

    FileManager.CreateFolder(this.paths.peripheral);
    Utils.logger.d(this.paths.peripheral + " (device specific sources) directory created");
    Utils.logger.resetIntentation();
}
PluginProcessor.prototype.generateReadmeFile = function() {
    Utils.logger.d("Generating README.txt file ...").intent();
    this.generateOutputWithTemplateAndModelInto(this.paths.templates.readme, this.profile, this.paths.output.readme);
    Utils.logger.unintent().d("README.txt file created.");
}
PluginProcessor.prototype.generateLicenseFile = function() {
    Utils.logger.d("Generating LICENSE.txt file ...").intent();
    this.generateOutputWithTemplateAndModelInto(this.paths.templates.license, null, this.paths.output.license);
    Utils.logger.unintent().d("LICENSE.txt file created.");
}
PluginProcessor.prototype.generateStaticFiles = function() {
    Utils.logger.d("Generating static files ...").intent();

    this.copyFile(this.paths.templates.srcBleBase);
    this.copyFile(this.paths.templates.srcBleCharacteristic);
    this.copyFile(this.paths.templates.srcBleService);
    this.copyFile(this.paths.templates.srcBleDevice);
    this.copyFile(this.paths.templates.srcBleValueParser);
    this.copyFile(this.paths.exampleParsers.heartRate);
    this.copyFile(this.paths.exampleParsers.stringParser);
    this.copyFile(this.paths.exampleParsers.batteryLevelParser);

    Utils.logger.unintent().d("All static files were created.");
}
PluginProcessor.prototype.generateTopDeviceWrapper = function() {
    var target = this.paths.peripheral + "\\Ble" + Utils.convertStringIntoProperCsharpName(this.profile.ProfileName) + ".cs";
    this.generateOutputWithTemplateAndModelInto(this.paths.templates.srcBleSpecificDevice, this.profile, target);
}
PluginProcessor.prototype.generateServiceWrapper = function(service) {
    Utils.logger.d("generating service class for service: " + service.Name + " UUID=[" + service.UUID + "]");
    var target = this.paths.peripheral + "\\Ble" + Utils.convertStringIntoProperCsharpName(service.Name) + "Service.cs";
    this.generateOutputWithTemplateAndModelInto(this.paths.templates.srcBleSpecificService, service, target);
}
PluginProcessor.prototype.generateAllServicesWrappers = function() {
    Utils.logger.d("Generating all services\' wrapper classes...").intent();
    for(var i = 0; i < this.profile.Services.length; i++) {
        var service = this.profile.Services[i];
        this.generateServiceWrapper(service);
    }
    Utils.logger.unintent().d("... all wrappers generated!");
}
PluginProcessor.prototype.printPostGenerationInstructions = function() {
    Utils.logger.cache("\n") // just add new line
                .cache("Generating source code for " + this.profile.ProfileName + " has finished.").cacheNewLine()
                .cache("Please read README.txt file in the output directory to find out how you can work with those files.").cacheNewLine()
                .cache("For more instructions check website: " + this.metadata.getLink())
                .flushCache();
}
PluginProcessor.prototype.generateOutputWithTemplateAndModelInto = function(template, data, output) {
    var _model = {
        model : data,
        meta :  new Metadata().updateFor(this.profile)
    };
    FileManager.CreateFile(output, this.applyModelIntoTemplate(_model, template));
}
PluginProcessor.prototype.applyModelIntoTemplate = function(model, template) {
    // internal BDS liquid template engine:
    // var _template = FileManager.ReadFile(template);
    // ProcessTemplate(_template, model)

    // internal Plugin template engine:
    return tmpl(template, model);
};
PluginProcessor.prototype.copyFile = function(filepath) {
    var targetPath = filepath.replace("_", "\\");
    this.generateOutputWithTemplateAndModelInto(filepath, null, targetPath);
}

PluginProcessor.prototype.run = function() {
    this.generateDirectories();
    this.generateReadmeFile();
    this.generateLicenseFile();
    this.generateStaticFiles();
    this.generateTopDeviceWrapper();
    this.generateAllServicesWrappers();

    this.printPostGenerationInstructions();
}
