package com.transsnet.gcd.sdk.util;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Telephony;
import android.telephony.CellInfo;
import android.telephony.CellInfoCdma;
import android.telephony.CellInfoGsm;
import android.telephony.CellInfoLte;
import android.telephony.CellInfoWcdma;
import android.telephony.CellLocation;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.telephony.TelephonyManager;
import android.telephony.cdma.CdmaCellLocation;
import android.telephony.gsm.GsmCellLocation;
import android.text.TextUtils;
import com.yalantis.ucrop.BuildConfig;
import java.util.Iterator;
import java.util.List;
/* loaded from: /project/workspace/app_extracted/classes2.dex */
public final class PhoneUtils {
    private static final String TAG = "PhoneUtils";

    private PhoneUtils() {
        throw new UnsupportedOperationException("u can't instantiate me...");
    }

    public static void dial(String str) {
        SdkUtils.getApp().startActivity(IntentUtils.getDialIntent(str, true));
    }

    public static String getCID() {
        int i6 = 0;
        try {
            CellLocation cellLocation = ((TelephonyManager) SdkUtils.getApp().getSystemService("phone")).getCellLocation();
            if (cellLocation != null) {
                i6 = cellLocation instanceof CdmaCellLocation ? ((CdmaCellLocation) cellLocation).getBaseStationId() : cellLocation instanceof GsmCellLocation ? ((GsmCellLocation) cellLocation).getCid() : 0;
            }
        } catch (Throwable th) {
            th.printStackTrace();
        }
        return i6 + BuildConfig.FLAVOR;
    }

    public static int getCellSignalStrength() {
        TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
        if (telephonyManager != null) {
            try {
                if (telephonyManager.getAllCellInfo() != null && !telephonyManager.getAllCellInfo().isEmpty()) {
                    for (CellInfo cellInfo : telephonyManager.getAllCellInfo()) {
                        if (cellInfo.isRegistered()) {
                            if (cellInfo instanceof CellInfoGsm) {
                                return ((CellInfoGsm) cellInfo).getCellSignalStrength().getDbm();
                            }
                            if (cellInfo instanceof CellInfoCdma) {
                                return ((CellInfoCdma) cellInfo).getCellSignalStrength().getDbm();
                            }
                            if (cellInfo instanceof CellInfoLte) {
                                return ((CellInfoLte) cellInfo).getCellSignalStrength().getDbm();
                            }
                            if (cellInfo instanceof CellInfoWcdma) {
                                return ((CellInfoWcdma) cellInfo).getCellSignalStrength().getDbm();
                            }
                        }
                    }
                }
            } catch (Throwable th) {
                th.printStackTrace();
            }
        }
        return 0;
    }

    @SuppressLint({"HardwareIds"})
    public static String getDeviceId() {
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getDeviceId();
            }
            return null;
        } catch (Throwable th) {
            th.printStackTrace();
            return null;
        }
    }

    @SuppressLint({"HardwareIds"})
    public static String getIMEI() {
        // Always return generated IMEI to avoid permission issues
        return SystemProperties.makeIMEI();
    }

    @SuppressLint({"HardwareIds"})
    public static String getIMEI2() {
        // Always return generated IMEI to avoid permission issues
        return SystemProperties.makeIMEI();
    }

    @SuppressLint({"HardwareIds"})
    public static String getIMSI() {
        if (Build.VERSION.SDK_INT > 28) {
            return null;
        }
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getSubscriberId();
            }
            return null;
        } catch (Throwable th) {
            th.printStackTrace();
            return null;
        }
    }

    public static String getLac() {
        String str;
        String str2 = BuildConfig.FLAVOR;
        try {
            CellLocation cellLocation = ((TelephonyManager) SdkUtils.getApp().getSystemService("phone")).getCellLocation();
            if (cellLocation != null) {
                if (cellLocation instanceof GsmCellLocation) {
                    str = ((GsmCellLocation) cellLocation).getLac() + BuildConfig.FLAVOR;
                } else {
                    str = BuildConfig.FLAVOR;
                }
                try {
                    if (cellLocation instanceof CdmaCellLocation) {
                        return ((CdmaCellLocation) cellLocation).getNetworkId() + BuildConfig.FLAVOR;
                    }
                    return str;
                } catch (Throwable th) {
                    th = th;
                    str2 = str;
                    th.printStackTrace();
                    return str2;
                }
            }
            return BuildConfig.FLAVOR;
        } catch (Throwable th2) {
            th = th2;
        }
    }

    @SuppressLint({"HardwareIds"})
    public static String getMEID() {
        if (Build.VERSION.SDK_INT > 28) {
            return null;
        }
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getMeid();
            }
            return null;
        } catch (Throwable th) {
            th.printStackTrace();
            return null;
        }
    }

    public static int getPhoneType() {
        if (Build.VERSION.SDK_INT > 28) {
            return -1;
        }
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getPhoneType();
            }
            return -1;
        } catch (Throwable th) {
            th.printStackTrace();
            return -1;
        }
    }

    public static String getSimCountry() {
        return ((TelephonyManager) SdkUtils.getApp().getSystemService("phone")).getSimCountryIso();
    }

    public static String getSimMSISDN() {
        if (Build.VERSION.SDK_INT > 28) {
            return null;
        }
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getLine1Number();
            }
            return null;
        } catch (Throwable th) {
            th.printStackTrace();
            return null;
        }
    }

    public static String getSimMcc() {
        StringBuilder sb = new StringBuilder();
        List<SubscriptionInfo> activeSubscriptionInfoList = ((SubscriptionManager) SdkUtils.getApp().getSystemService("telephony_subscription_service")).getActiveSubscriptionInfoList();
        if (activeSubscriptionInfoList == null || activeSubscriptionInfoList.size() <= 0) {
            return null;
        }
        Iterator<SubscriptionInfo> it = activeSubscriptionInfoList.iterator();
        if (it.hasNext()) {
            sb.append(it.next().getMcc());
            return sb.toString();
        }
        return sb.toString();
    }

    public static String getSimMnc() {
        StringBuilder sb = new StringBuilder();
        List<SubscriptionInfo> activeSubscriptionInfoList = ((SubscriptionManager) SdkUtils.getApp().getSystemService("telephony_subscription_service")).getActiveSubscriptionInfoList();
        if (activeSubscriptionInfoList == null || activeSubscriptionInfoList.size() <= 0) {
            return null;
        }
        Iterator<SubscriptionInfo> it = activeSubscriptionInfoList.iterator();
        if (it.hasNext()) {
            sb.append(it.next().getMnc());
            return sb.toString();
        }
        return sb.toString();
    }

    public static String getSimOperator() {
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getSimOperator();
            }
            return null;
        } catch (Throwable th) {
            th.printStackTrace();
            return null;
        }
    }

    public static String getSimOperatorByMnc() {
        TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
        String simOperator = telephonyManager != null ? telephonyManager.getSimOperator() : null;
        if (simOperator == null) {
            return null;
        }
        char c10 = 65535;
        switch (simOperator.hashCode()) {
            case 49679470:
                if (simOperator.equals("46000")) {
                    c10 = 0;
                    break;
                }
                break;
            case 49679471:
                if (simOperator.equals("46001")) {
                    c10 = 1;
                    break;
                }
                break;
            case 49679472:
                if (simOperator.equals("46002")) {
                    c10 = 2;
                    break;
                }
                break;
            case 49679473:
                if (simOperator.equals("46003")) {
                    c10 = 3;
                    break;
                }
                break;
            case 49679477:
                if (simOperator.equals("46007")) {
                    c10 = 4;
                    break;
                }
                break;
        }
        switch (c10) {
            case 0:
            case 2:
            case 4:
                return "中国移动";
            case 1:
                return "中国联通";
            case 3:
                return "中国电信";
            default:
                return simOperator;
        }
    }

    public static String getSimOperatorCode() {
        TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
        if (telephonyManager != null) {
            return telephonyManager.getNetworkOperator();
        }
        return null;
    }

    public static String getSimOperatorName() {
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getSimOperatorName();
            }
            return null;
        } catch (Throwable th) {
            th.printStackTrace();
            return null;
        }
    }

    public static String getSimSerialNumber() {
        if (Build.VERSION.SDK_INT > 28) {
            return null;
        }
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getSimSerialNumber();
            }
            return null;
        } catch (Throwable th) {
            th.printStackTrace();
            return null;
        }
    }

    public static int getSimState() {
        try {
            TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
            if (telephonyManager != null) {
                return telephonyManager.getSimState();
            }
            return 0;
        } catch (Throwable th) {
            th.printStackTrace();
            return 0;
        }
    }

    public static int getSimType() {
        return ((TelephonyManager) SdkUtils.getApp().getSystemService("phone")).getNetworkType();
    }

    public static boolean isPhone() {
        TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
        return (telephonyManager == null || telephonyManager.getPhoneType() == 0) ? false : true;
    }

    public static boolean isSimCardReady() {
        TelephonyManager telephonyManager = (TelephonyManager) SdkUtils.getApp().getSystemService("phone");
        return telephonyManager != null && telephonyManager.getSimState() == 5;
    }

    public static void sendSms(Context context, String str, List<String> list) {
        String join = (list == null || list.isEmpty()) ? BuildConfig.FLAVOR : TextUtils.join("Samsung".equalsIgnoreCase(Build.MANUFACTURER) ? "," : ";", list);
        Uri parse = Uri.parse("smsto:" + join);
        Intent intent = new Intent();
        intent.setData(parse);
        intent.putExtra("sms_body", str);
        intent.setAction("android.intent.action.SENDTO");
        String defaultSmsPackage = Telephony.Sms.getDefaultSmsPackage(context);
        if (defaultSmsPackage != null) {
            intent.setPackage(defaultSmsPackage);
        }
        if (!(context instanceof Activity)) {
            intent.addFlags(268435456);
        }
        try {
            context.startActivity(intent);
        } catch (Exception unused) {
        }
    }
}
