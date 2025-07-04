# TWA (Trusted Web Activity) Setup Guide
## Hướng dẫn tạo Android App từ PWA để publish lên Google Play Store

### 1. Cài đặt công cụ cần thiết

#### Yêu cầu hệ thống:
- **Node.js** 16+ 
- **Java Development Kit (JDK)** 11+
- **Android Studio** hoặc **Android SDK Command Line Tools**
- **Bubblewrap CLI** (Google's TWA tool)

#### Cài đặt Bubblewrap:
```bash
npm install -g @bubblewrap/cli
```

#### Kiểm tra cài đặt:
```bash
bubblewrap --version
java -version
```

### 2. Khởi tạo TWA project

#### Tạo project mới:
```bash
# Tạo thư mục mới cho TWA
mkdir iwedplan-twa
cd iwedplan-twa

# Khởi tạo TWA project
bubblewrap init --manifest https://yourdomain.com/manifest.json
```

#### Thông tin cần thiết khi khởi tạo:
- **Application ID**: `com.iwedplan.twa`
- **Application Name**: `iWedplan`
- **Package Name**: `com.iwedplan.twa`
- **Launcher Icon**: Đường dẫn đến icon 512x512px
- **Splash Screen**: Đường dẫn đến splash screen image
- **Theme Color**: `#ec4899`
- **Background Color**: `#fdf2f8`
- **Start URL**: `https://yourdomain.com/`
- **Display Mode**: `standalone`
- **Orientation**: `portrait`

### 3. Cấu hình Digital Asset Links

#### Tạo file `.well-known/assetlinks.json` trong public folder:
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.iwedplan.twa",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

#### Lấy SHA256 fingerprint:
```bash
# Development key (Debug)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Production key (Release) - sau khi tạo signing key
keytool -list -v -keystore release-key.keystore -alias iwedplan-key
```

### 4. Cấu hình TWA Manifest

#### File `twa-manifest.json`:
```json
{
  "packageId": "com.iwedplan.twa",
  "host": "yourdomain.com",
  "name": "iWedplan",
  "launcherName": "iWedplan",
  "display": "standalone",
  "orientation": "portrait",
  "themeColor": "#ec4899",
  "backgroundColor": "#fdf2f8",
  "startUrl": "/",
  "iconUrl": "https://yourdomain.com/icons/icon-512.png",
  "maskableIconUrl": "https://yourdomain.com/icons/icon-512-maskable.png",
  "monochromeIconUrl": "https://yourdomain.com/icons/icon-512-monochrome.png",
  "splashScreenFadeOutDuration": 300,
  "enableNotifications": true,
  "features": {
    "locationDelegation": {
      "enabled": false
    },
    "playBilling": {
      "enabled": false
    }
  },
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "url": "/dashboard",
      "icon": "https://yourdomain.com/icons/shortcut-dashboard.png"
    },
    {
      "name": "Tạo website",
      "short_name": "Tạo web",
      "url": "/create/template",
      "icon": "https://yourdomain.com/icons/shortcut-create.png"
    },
    {
      "name": "AI Planning",
      "short_name": "AI Plan",
      "url": "/dashboard?tab=ai-chat",
      "icon": "https://yourdomain.com/icons/shortcut-ai.png"
    }
  ],
  "additionalTrustedOrigins": [],
  "retainedBundles": [],
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "webManifestUrl": "https://yourdomain.com/manifest.json",
  "fallbackType": "customtabs",
  "enableSiteSettingsShortcut": true,
  "orientation": "portrait"
}
```

### 5. Build và Test

#### Build APK để test:
```bash
# Build debug APK
bubblewrap build

# Cài đặt trên thiết bị Android (qua USB debugging)
bubblewrap install
```

#### Test trên Android device:
1. Bật **Developer Options** và **USB Debugging**
2. Kết nối device qua USB
3. Run: `adb devices` để kiểm tra device
4. Install APK: `bubblewrap install`

### 6. Tạo Production Build

#### Tạo signing key cho production:
```bash
# Tạo keystore file
keytool -genkey -v -keystore release-key.keystore -alias iwedplan-key -keyalg RSA -keysize 2048 -validity 10000

# Thông tin cần nhập:
# - Store password: [Lưu password an toàn]
# - Key password: [Lưu password an toàn]  
# - First and Last Name: iWedplan Team
# - Organizational Unit: Development
# - Organization: iWedplan
# - City: Ho Chi Minh City
# - State: Ho Chi Minh
# - Country: VN
```

#### Build release APK:
```bash
# Build với signing key
bubblewrap build --keystore release-key.keystore --alias iwedplan-key
```

#### Tạo AAB (Android App Bundle) cho Play Store:
```bash
# Build AAB format (preferred by Google Play)
bubblewrap build --appBundle --keystore release-key.keystore --alias iwedplan-key
```

### 7. Chuẩn bị Assets cho Play Store

#### Icon requirements:
- **App Icon**: 512x512px (PNG, no transparency)
- **Feature Graphic**: 1024x500px (PNG/JPG)
- **Screenshots**: 
  - Phone: ít nhất 2 screenshots (320dp - 3840dp)
  - Tablet: ít nhất 1 screenshot (7-inch và 10-inch)

#### Store Listing content:
- **App Title**: "iWedplan - Wedding Planner"
- **Short Description**: "Ứng dụng lập kế hoạch đám cưới thông minh với AI Assistant"
- **Full Description**: [Chi tiết về app features]
- **Privacy Policy URL**: https://yourdomain.com/privacy-policy
- **Category**: Lifestyle > Events
- **Content Rating**: Everyone
- **Target Age**: 18+ (adult content - wedding planning)

### 8. Google Play Console Setup

#### Tạo app trên Play Console:
1. Đăng nhập **Google Play Console**
2. Tạo **New App**:
   - App Name: "iWedplan - Wedding Planner"
   - Default Language: Vietnamese
   - App Type: App
   - Free/Paid: Free (hoặc Paid nếu có subscription)

#### Upload AAB file:
1. Vào **Release Management > App Releases**
2. Chọn **Internal Testing** để test trước
3. Upload file `.aab`
4. Điền **Release Notes**

#### App Content & Privacy:
1. **Privacy Policy**: Link đến privacy policy
2. **App Content**: 
   - Target Age: 18+
   - Content Rating: Everyone
   - Data Safety: [Điền thông tin về data collection]
3. **App Access**: Choose whether app is unrestricted
4. **Ads**: Indicate if app contains ads

### 9. Testing & Review

#### Internal Testing:
1. Tạo **Internal Testing Track**
2. Thêm **Test Users** (email addresses)
3. Upload APK/AAB và test thoroughly
4. Fix bugs nếu có

#### Pre-launch Report:
- Google sẽ chạy automated testing
- Review report và fix issues
- Đảm bảo app pass tất cả tests

#### Submit for Review:
1. Complete tất cả required sections
2. Submit app cho **Production Review**
3. Thời gian review: 1-3 ngày
4. Nhận notification qua email

### 10. Production Deployment

#### Release to Production:
1. Sau khi approved, chọn **Release to Production**
2. Set **Release Percentage** (có thể staged rollout)
3. Monitor app performance và user feedback
4. Update app theo feedback

#### Post-launch checklist:
- [ ] Monitor crash reports
- [ ] Check user reviews và ratings
- [ ] Update app thường xuyên
- [ ] Monitor performance metrics
- [ ] Respond to user feedback

### 11. Continuous Updates

#### App Updates:
```bash
# Update version trong twa-manifest.json
{
  "appVersionName": "1.0.1",
  "appVersionCode": 2
}

# Rebuild với version mới
bubblewrap build --appBundle --keystore release-key.keystore --alias iwedplan-key

# Upload lên Play Console
```

#### Best Practices:
- **Regular Updates**: Monthly updates with new features
- **Bug Fixes**: Quick response to critical bugs
- **Performance**: Monitor và optimize app performance
- **User Feedback**: Actively respond to reviews
- **Security**: Keep dependencies updated

### 12. Troubleshooting

#### Common Issues:

**Digital Asset Links không work:**
- Kiểm tra file `assetlinks.json` accessible at `yourdomain.com/.well-known/assetlinks.json`
- Verify SHA256 fingerprint correct
- Test với Google's Digital Asset Links tester

**App không install:**
- Check minimum SDK version compatibility
- Verify signing configuration
- Test trên different Android versions

**Store Rejection:**
- Review Google Play policies carefully
- Ensure app có unique value
- Fix any policy violations

**Performance Issues:**
- Optimize PWA performance trước khi build TWA
- Use Lighthouse để audit web app
- Minimize bundle size và loading times

### Resources & Tools

#### Useful Links:
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [Google Play Console](https://play.google.com/console)
- [Digital Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)
- [PWA Builder](https://www.pwabuilder.com/)

#### Monitoring Tools:
- **Google Play Console**: App performance và user metrics
- **Firebase Analytics**: Detailed user behavior tracking
- **Crashlytics**: Crash reporting và analysis
- **Lighthouse**: PWA performance auditing

---

**Lưu ý quan trọng:**
- Đảm bảo website PWA hoạt động tốt trước khi tạo TWA
- Test thoroughly trên nhiều Android devices
- Follow Google Play policies để tránh rejection
- Maintain regular updates và improvements