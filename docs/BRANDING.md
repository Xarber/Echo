# Branding

The user-selected name **Echo** is preserved. It expresses the way a thought can return, connect and develop. No claim of trademark clearance or global uniqueness is made. Tagline: Every thought deserves an echo. Initiative: OpenRecode.

Primary accent #6269F5; gradient #7E84FF to #5056DE. Light surfaces #FFFFFF on #F7F8FC, text #25273E and secondary #7C8098. Dark surfaces #202232 on #171824, text #EEEEF8. Use platform system fonts, restrained weights and generous line height. Feather icons provide consistent small controls, hidden from accessibility names when decorative.

The editable SVG master is assets/branding/echo-master.svg. Stable groups: background, primary-symbol, echo-ripple, thought-spark. Reusable gradient definition surface. A central dot/curved echo motif keeps the icon recognizable at small sizes. No third-party artwork or font is embedded in the logo.

`npm run assets:generate` uses Sharp to export 192/512 PWA icons, 1024 native icon, 512 maskable, Apple touch icon, Android adaptive foreground/monochrome and the public SVG. Theme SVG variants remain editable. Android foreground is inset to respect adaptive safe areas. iOS uses the 1024 source export workflow through Expo; a full Apple Icon Composer layered Liquid Glass asset is not implemented and must not be implied by having an SVG alone.

Screenshots must show functioning real screens; test diaries, if pictured, must be explicitly labeled synthetic. No promotional mockup is labeled as a product screenshot. Repository banners/social cards and final splash artwork remain future branding work.
