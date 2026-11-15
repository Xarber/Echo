Pod::Spec.new do |s|
  s.name = 'EchoReflection'
  s.version = '1.0.0'
  s.summary = 'On-device journal reflection for Echo'
  s.homepage = 'https://github.com/Xarber/Echo'
  s.license = 'AGPL-3.0-only'
  s.author = 'Echo contributors'
  s.platform = :ios, '16.4'
  s.source = { git: 'https://github.com/Xarber/Echo.git' }
  s.source_files = '**/*.swift'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
end
