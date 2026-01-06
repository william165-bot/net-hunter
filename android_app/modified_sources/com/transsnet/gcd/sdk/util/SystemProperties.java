package com.transsnet.gcd.sdk.util;

import com.yalantis.ucrop.BuildConfig;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
/* loaded from: /project/workspace/app_extracted/classes2.dex */
public class SystemProperties {
    private static Method sysPropGet;
    private static Method sysPropSet;

    static {
        Method[] methods;
        try {
            for (Method method : Class.forName("android.os.SystemProperties").getMethods()) {
                String name = method.getName();
                if (name.equals("get")) {
                    sysPropGet = method;
                } else if (name.equals("set")) {
                    sysPropSet = method;
                }
            }
        } catch (ClassNotFoundException e4) {
            e4.printStackTrace();
        }
    }

    private SystemProperties() {
    }

    public static String get(String str, String str2) {
        try {
            return (String) sysPropGet.invoke(null, str, str2);
        } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e4) {
            e4.printStackTrace();
            return str2;
        }
    }

    public static String makeIMEI() {
        String str = ((int) (Math.floor(Math.random() * 9000000.0d) + 1000000.0d)) + BuildConfig.FLAVOR + ((int) (Math.floor(Math.random() * 9000000.0d) + 1000000.0d));
        char[] charArray = str.toCharArray();
        int i6 = 0;
        for (int i10 = 0; i10 < charArray.length; i10 += 2) {
            int parseInt = Integer.parseInt(String.valueOf(charArray[i10]));
            int parseInt2 = Integer.parseInt(String.valueOf(charArray[i10 + 1])) * 2;
            if (parseInt2 >= 10) {
                parseInt2 -= 9;
            }
            i6 += parseInt + parseInt2;
        }
        int i11 = i6 % 10;
        return str + (i11 != 0 ? 10 - i11 : 0);
    }

    public static void set(String str, String str2) {
        try {
            sysPropSet.invoke(null, str, str2);
        } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e4) {
            e4.printStackTrace();
        }
    }
}
