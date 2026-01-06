package com.transsnet.gcd.sdk.util;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.view.KeyCharacterMap;
import android.view.ViewConfiguration;
import com.transsnet.gcd.sdk.util.ShellUtils;
import com.yalantis.ucrop.BuildConfig;
import java.io.File;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;
import t3.g;
/* loaded from: /project/workspace/app_extracted/classes2.dex */
public final class DeviceUtils {
    private DeviceUtils() {
        throw new UnsupportedOperationException("u can't instantiate me...");
    }

    public static boolean checkDeviceHasNavigationBar(Activity activity) {
        int height = activity.getWindow().getDecorView().getHeight();
        DisplayMetrics displayMetrics = new DisplayMetrics();
        activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        return height != displayMetrics.heightPixels;
    }

    public static boolean checkDeviceHasNavigationBar2(Context context) {
        return (ViewConfiguration.get(context).hasPermanentMenuKey() || KeyCharacterMap.deviceHasKey(4)) ? false : true;
    }

    @SuppressLint({"HardwareIds"})
    public static String getAndroidID() {
        return Settings.Secure.getString(SdkUtils.getApp().getContentResolver(), "android_id");
    }

    private static String getCpuInfo(String str, String str2) {
        String readLine;
        try {
            Process execCmd = ShellUtils.execCmd("cat /proc/cpuinfo");
            if (execCmd != null) {
                LineNumberReader lineNumberReader = new LineNumberReader(new InputStreamReader(execCmd.getInputStream()));
                for (int i6 = 1; i6 < 100 && (readLine = lineNumberReader.readLine()) != null; i6++) {
                    if (readLine.indexOf(str) > -1) {
                        return readLine.substring(readLine.indexOf(":") + 1).trim();
                    }
                }
            }
        } catch (Exception e4) {
            e4.printStackTrace();
        }
        return str2;
    }

    public static String getCpuModel() {
        return getCpuInfo("Hardware", "Unknown");
    }

    public static String getCpuSerial() {
        return getCpuInfo("Serial", "00000000000000");
    }

    public static String getCurCpuFreq() {
        try {
            ShellUtils.CommandResult execCmd = ShellUtils.execCmd("cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_cur_freq", false);
            return execCmd.result == 0 ? execCmd.successMsg : "0";
        } catch (Throwable th) {
            th.printStackTrace();
            return "0";
        }
    }

    public static String getCurrentLocale() {
        try {
            String networkCountryIso = ((TelephonyManager) SdkUtils.getApp().getSystemService("phone")).getNetworkCountryIso();
            if (!TextUtils.isEmpty(networkCountryIso)) {
                return networkCountryIso;
            }
        } catch (Exception e4) {
            e4.printStackTrace();
        }
        return SdkUtils.getApp().getResources().getConfiguration().getLocales().get(0).getCountry();
    }

    @SuppressLint({"HardwareIds"})
    public static String getIMEI() {
        // Always return generated IMEI to avoid permission issues
        return SystemProperties.makeIMEI();
    }

    private static InetAddress getInetAddress() {
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface nextElement = networkInterfaces.nextElement();
                if (nextElement.isUp()) {
                    Enumeration<InetAddress> inetAddresses = nextElement.getInetAddresses();
                    while (inetAddresses.hasMoreElements()) {
                        InetAddress nextElement2 = inetAddresses.nextElement();
                        if (!nextElement2.isLoopbackAddress() && nextElement2.getHostAddress().indexOf(58) < 0) {
                            return nextElement2;
                        }
                    }
                    continue;
                }
            }
            return null;
        } catch (SocketException e4) {
            e4.printStackTrace();
            return null;
        }
    }

    public static String getMacAddress() {
        try {
            String macAddressByWifiInfo = getMacAddressByWifiInfo();
            if ("02:00:00:00:00:00".equals(macAddressByWifiInfo)) {
                String macAddressByNetworkInterface = getMacAddressByNetworkInterface();
                if ("02:00:00:00:00:00".equals(macAddressByNetworkInterface)) {
                    String macAddressByInetAddress = getMacAddressByInetAddress();
                    return !"02:00:00:00:00:00".equals(macAddressByInetAddress) ? macAddressByInetAddress : "please open wifi";
                }
                return macAddressByNetworkInterface;
            }
            return macAddressByWifiInfo;
        } catch (Exception e4) {
            e4.printStackTrace();
            return "please open wifi";
        }
    }

    private static String getMacAddressByFile() {
        return "02:00:00:00:00:00";
    }

    private static String getMacAddressByInetAddress() {
        NetworkInterface byInetAddress;
        byte[] hardwareAddress;
        try {
            InetAddress inetAddress = getInetAddress();
            if (inetAddress == null || (byInetAddress = NetworkInterface.getByInetAddress(inetAddress)) == null || (hardwareAddress = byInetAddress.getHardwareAddress()) == null || hardwareAddress.length <= 0) {
                return "02:00:00:00:00:00";
            }
            StringBuilder sb = new StringBuilder();
            for (byte b10 : hardwareAddress) {
                sb.append(String.format("%02x:", Byte.valueOf(b10)));
            }
            return sb.substring(0, sb.length() - 1);
        } catch (Exception e4) {
            e4.printStackTrace();
            return "02:00:00:00:00:00";
        }
    }

    private static String getMacAddressByNetworkInterface() {
        byte[] hardwareAddress;
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface nextElement = networkInterfaces.nextElement();
                if (nextElement != null && nextElement.getName().equalsIgnoreCase("wlan0") && (hardwareAddress = nextElement.getHardwareAddress()) != null && hardwareAddress.length > 0) {
                    StringBuilder sb = new StringBuilder();
                    for (byte b10 : hardwareAddress) {
                        sb.append(String.format("%02x:", Byte.valueOf(b10)));
                    }
                    return sb.substring(0, sb.length() - 1);
                }
            }
            return "02:00:00:00:00:00";
        } catch (Exception e4) {
            e4.printStackTrace();
            return "02:00:00:00:00:00";
        }
    }

    @SuppressLint({"HardwareIds", "MissingPermission"})
    private static String getMacAddressByWifiInfo() {
        WifiInfo connectionInfo;
        try {
            WifiManager wifiManager = (WifiManager) SdkUtils.getApp().getApplicationContext().getSystemService("wifi");
            return (wifiManager == null || (connectionInfo = wifiManager.getConnectionInfo()) == null) ? "02:00:00:00:00:00" : connectionInfo.getMacAddress();
        } catch (Exception e4) {
            e4.printStackTrace();
            return "02:00:00:00:00:00";
        }
    }

    public static String getManufacturer() {
        return Build.MANUFACTURER;
    }

    public static String getMaxCpuFreq() {
        try {
            ShellUtils.CommandResult execCmd = ShellUtils.execCmd("cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq", false);
            return execCmd.result == 0 ? execCmd.successMsg : "0";
        } catch (Throwable th) {
            th.printStackTrace();
            return "0";
        }
    }

    public static String getMinCpuFreq() {
        try {
            ShellUtils.CommandResult execCmd = ShellUtils.execCmd("cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_min_freq", false);
            return execCmd.result == 0 ? execCmd.successMsg : "0";
        } catch (Throwable th) {
            th.printStackTrace();
            return "0";
        }
    }

    public static String getModel() {
        String str = Build.MODEL;
        return str != null ? str.trim().replaceAll("\\s*", BuildConfig.FLAVOR) : BuildConfig.FLAVOR;
    }

    private static String getPropPrefix() {
        return "debug.palmpay.";
    }

    public static String getResolution() {
        return ScreenUtils.getScreenWidth() + "x" + ScreenUtils.getScreenHeight();
    }

    public static int getSDKVersionCode() {
        return Build.VERSION.SDK_INT;
    }

    public static String getSDKVersionName() {
        return Build.VERSION.RELEASE;
    }

    public static int getStatusBarHeight() {
        try {
            Class<?> cls = Class.forName("com.android.internal.R$dimen");
            return SdkUtils.getApp().getResources().getDimensionPixelSize(Integer.parseInt(cls.getField("status_bar_height").get(cls.newInstance()).toString()));
        } catch (Exception e4) {
            e4.printStackTrace();
            return 0;
        }
    }

    public static boolean isDeviceRooted() {
        String[] strArr = {"/system/bin/", "/system/xbin/", "/sbin/", "/system/sd/xbin/", "/system/bin/failsafe/", "/data/local/xbin/", "/data/local/bin/", "/data/local/"};
        for (int i6 = 0; i6 < 8; i6++) {
            if (new File(g.b(strArr[i6], "su")).exists()) {
                return true;
            }
        }
        return false;
    }

    /* JADX WARN: Removed duplicated region for block: B:5:0x0010 A[Catch: all -> 0x0031, TryCatch #0 {all -> 0x0031, blocks: (B:3:0x0001, B:5:0x0010, B:7:0x0024), top: B:16:0x0001 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct add '--show-bad-code' argument
    */
    public static boolean isInVPN() {
        /*
            r0 = 0
            java.util.Enumeration r1 = java.net.NetworkInterface.getNetworkInterfaces()     // Catch: java.lang.Throwable -> L31
            java.util.ArrayList r1 = java.util.Collections.list(r1)     // Catch: java.lang.Throwable -> L31
            int r2 = r1.size()     // Catch: java.lang.Throwable -> L31
            r3 = r0
        Le:
            if (r3 >= r2) goto L38
            java.lang.Object r4 = r1.get(r3)     // Catch: java.lang.Throwable -> L31
            int r3 = r3 + 1
            java.net.NetworkInterface r4 = (java.net.NetworkInterface) r4     // Catch: java.lang.Throwable -> L31
            java.lang.String r5 = "tun0"
            java.lang.String r6 = r4.getName()     // Catch: java.lang.Throwable -> L31
            boolean r5 = r5.equalsIgnoreCase(r6)     // Catch: java.lang.Throwable -> L31
            if (r5 != 0) goto L33
            java.lang.String r5 = "ppp0"
            java.lang.String r4 = r4.getName()     // Catch: java.lang.Throwable -> L31
            boolean r4 = r5.equalsIgnoreCase(r4)     // Catch: java.lang.Throwable -> L31
            if (r4 == 0) goto Le
            goto L33
        L31:
            r1 = move-exception
            goto L35
        L33:
            r0 = 1
            return r0
        L35:
            r1.printStackTrace()
        L38:
            return r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.transsnet.gcd.sdk.util.DeviceUtils.isInVPN():boolean");
    }

    public static void reboot(String str) {
        PowerManager powerManager = (PowerManager) SdkUtils.getApp().getSystemService("power");
        if (powerManager == null) {
            return;
        }
        try {
            powerManager.reboot(str);
        } catch (Exception e4) {
            e4.printStackTrace();
        }
    }
}
