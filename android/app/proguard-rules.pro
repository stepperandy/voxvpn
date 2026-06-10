# General rules
-keepattributes *Annotation*
-keep class * extends java.util.ListResourceBundle {
    protected Object[][] getContents();
}

# Capacitor
-keepclasseswithmembernames class com.getcapacitor.** {
    public <methods>;
}

-keepclasseswithmembernames interface com.getcapacitor.** {
    public <methods>;
}

# VPN-related libraries (add more based on your dependencies)
-keep class android.system.** { *; }
-keep interface android.system.** { *; }

# React Native (if applicable)
-keep class com.facebook.react.** { *; }
-keepclasseswithmembernames class com.facebook.react.** {
    native <methods>;
}

# Preserve line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
