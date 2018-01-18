# -*- encoding: utf-8 -*-
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'capistrano3/nginx_unicorn/version'

Gem::Specification.new do |gem|
  gem.name          = "capistrano3-nginx_unicorn"
  gem.version       = Capistrano3::NginxUnicorn::VERSION
  gem.authors       = ["Ivan Tkalin", "Oleg Bavaev"]
  gem.email         = ["itkalin@gmail.com", "jesoba7@gmail.com"]
  gem.description   = %q{Capistrano v3 tasks for configuration and management nginx+unicorn combo for zero downtime deployments of Rails applications. Configs can be copied to the application using generators and easily customized.}
  gem.summary       = %q{Create and manage nginx+unicorn configs from capistrano v3}
  gem.homepage      = "https://github.com/jesson/capistrano3-nginx_unicorn"

  gem.files         = `git ls-files`.split($/)
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.require_paths = ["lib"]

  gem.add_dependency 'capistrano', '>= 3.0.0'

  gem.add_development_dependency "rake"
end
