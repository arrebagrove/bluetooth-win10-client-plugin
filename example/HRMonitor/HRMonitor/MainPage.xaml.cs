/******************************************************************************
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
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Windows.ApplicationModel;
using Windows.Devices.Bluetooth;
using Windows.Devices.Bluetooth.GenericAttributeProfile;
using Windows.Storage.Streams;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using com.matchboxmobile.ble.wrappers;

namespace HRMonitor
{
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
            Application.Current.Suspending += CurrentOnSuspending;
        }

        private async void CurrentOnSuspending(object sender, SuspendingEventArgs suspendingEventArgs)
        {
            if(HrDevice != null) await HrDevice.Close();
        }

        private async void BtnConnect_Click(object sender, RoutedEventArgs e)
        {
            d("Button CONNECT clicked.");
            HrDevice = await BleHeartRate.FirstOrDefault();
            if (HrDevice == null)
            {
                d("I was not able to find any HR device!");
                return;
            }

            d("Found device: " + HrDevice.Name + " IsConnected=" + HrDevice.IsConnected);
            // we should always monitor the connection status
            HrDevice.DeviceConnectionStatusChanged -= HrDeviceOnDeviceConnectionStatusChanged;
            HrDevice.DeviceConnectionStatusChanged += HrDeviceOnDeviceConnectionStatusChanged;

            // we can create value parser and listen for parsed values of given characteristic
            HrParser.ConnectWithCharacteristic(HrDevice.HeartRate.HeartRateMeasurement);
            HrParser.ValueChanged -= HrParserOnValueChanged;
            HrParser.ValueChanged += HrParserOnValueChanged;

            // connect also battery level parser to proper characteristic
            BatteryParser.ConnectWithCharacteristic(HrDevice.BatteryService.BatteryLevel);

            // we can monitor raw data notified by BLE device for specific characteristic
            HrDevice.HeartRate.HeartRateMeasurement.ValueChanged -= HeartRateMeasurementOnValueChanged;
            HrDevice.HeartRate.HeartRateMeasurement.ValueChanged += HeartRateMeasurementOnValueChanged;

            // we could force propagation of event with connection status change, to run the callback for initial status
            HrDevice.NotifyConnectionStatus();
        }

        private void HeartRateMeasurementOnValueChanged(object sender, ValueChangedEventArgs args)
        {
            d("RAW value change event received:" + args.Value);
        }

        private async void HrParserOnValueChanged(object device, ValueChangedEventArgs<short> arg)
        {
            await RunOnUiThread(() =>
            {
                d("Got new measurement: " + arg.Value);
                TxtHr.Text = String.Format("{0} bpm", arg.Value);
            });
        }

        private async void HrDeviceOnDeviceConnectionStatusChanged(object device, BleDeviceConnectionStatusChangedEventArgs args)
        {
            d("Current connection status is: " + args.ConnectionStatus);
            await RunOnUiThread(async () =>
            {
                bool connected = (args.ConnectionStatus == BluetoothConnectionStatus.Connected);
                if (connected)
                {
                    TxtStatus.Text = HrDevice.Name + ": connected";
                    byte battery = await BatteryParser.Read();
                    TxtBattery.Text = String.Format("battery level: {0}%", battery);
                }
                else
                {
                    TxtStatus.Text = "disconnected";
                    TxtBattery.Text = "battery level: --";
                    TxtHr.Text = "--";
                }

                BtnStart.IsEnabled = connected;
                BtnStop.IsEnabled = connected;
                BtnReadInfo.IsEnabled = connected;
            });
        }

        private async void BtnStart_Click(object sender, RoutedEventArgs e)
        {
            d("Button START clicked.");
            await HrParser.EnableNotifications();
            d("Notification enabled");
        }

        private async void BtnStop_Click(object sender, RoutedEventArgs e)
        {
            d("Button STOP clicked.");
            await HrParser.DisableNotifications();
            d("Notification disabled.");
            TxtHr.Text = "--";
        }

        private async void BtnReadInfo_Click(object sender, RoutedEventArgs e)
        {
            d("Reading DeviceInformation Characteristic ...");
            var firmware = await HrDevice.DeviceInformation.FirmwareRevisionString.ReadAsString();
        
            var hardware = await HrDevice.DeviceInformation.HardwareRevisionString.ReadAsString();
            var producer = await HrDevice.DeviceInformation.ManufacturerNameString.ReadAsString();
            var serialNumber = await HrDevice.DeviceInformation.SerialNumberString.ReadAsString();
            var modelNumber = await HrDevice.DeviceInformation.ModelNumberString.ReadAsString();

            d($" Producer : {producer}"); d("");
            d($"    Model : {modelNumber}"); d("");
            d($"      S/N : {serialNumber}"); d("");
            d($" Firmware : {firmware}"); d("");
            d($" Hardware : {hardware}"); d("");

            // update also battery
            byte battery = await BatteryParser.Read();
            TxtBattery.Text = String.Format("battery level: {0}%", battery);
        }

        [Conditional("DEBUG")]
        private void d(string txt)
        {
            Debug.WriteLine(txt);
        }

        private async Task RunOnUiThread(Action a)
        {
            await this.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                a();
            });
        }

        private BleHeartRate HrDevice { get; set; }
        private HeartRateMeasurementParser HrParser { get; } = new HeartRateMeasurementParser();
        private BatteryLevelParser BatteryParser { get; } = new BatteryLevelParser();
    }
}
