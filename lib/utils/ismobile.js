define(function() {
  var isMobile;
  (function(a){a||(a=isMobile={});var c=/Android/i,b=navigator.userAgent;a.apple={};a.apple.phone=/iPhone/i.test(b);a.apple.ipod=/iPod/i.test(b);a.apple.tablet=/iPad/i.test(b);a.apple.device=a.apple.phone||a.apple.ipod||a.apple.tablet;a.android={};a.android.phone=/(?=.*\bAndroid\b)(?=.*\bMobile\b)/i.test(b);a.android.tablet=!a.android.phone&&c.test(b);a.android.device=a.android.phone||a.android.tablet;a.seven_inch=/(?:Nexus 7|BNTV250|Kindle Fire|Silk|GT-P1000)/i.test(b)})(isMobile);
  return isMobile;
});