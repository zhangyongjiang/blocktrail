require 'capistrano'

namespace :load do
  task :defaults do
    set :templates_path, "config/deploy/templates"

    set :nginx_server_name, -> { "www.example.com" }
    set :nginx_use_ssl, false
    set :nginx_ssl_certificate, -> { "#{fetch(:nginx_server_name)}.crt" }
    set :nginx_ssl_certificate_key, -> { "#{fetch(:nginx_server_name)}.key" }
    set :nginx_upload_local_certificate, -> { true }
    set :nginx_ssl_certificate_local_path, -> { "/etc/certificates/" }
    set :nginx_ssl_certificate_key_local_path, -> { "/etc/certificates/keys" }

    set :unicorn_pid, -> { "#{current_path}/tmp/pids/unicorn.pid" }
    set :unicorn_config, -> { "#{shared_path}/config/unicorn.rb" }
    set :unicorn_log, -> { "#{shared_path}/log/unicorn.log" }
    set :unicorn_user, -> { fetch(:user) }
    set :unicorn_workers, 4
  end
end

namespace :nginx do
  desc "Setup nginx configuration for this application"
  task :setup do
    on roles(:web) do
      template("nginx_conf.erb", "/tmp/#{fetch(:application)}.conf")
      execute "sudo mv /tmp/#{fetch(:application)}.conf /etc/nginx/sites-available/#{fetch(:application)}.conf"
      execute "sudo ln -fs /etc/nginx/sites-available/#{fetch(:application)}.conf /etc/nginx/sites-enabled/#{fetch(:application)}.conf"

      if fetch(:nginx_use_ssl)
        if nginx_upload_local_certificate
          put File.read(nginx_ssl_certificate_local_path), "/tmp/#{fetch(:nginx_ssl_certificate)}"
          put File.read(nginx_ssl_certificate_key_local_path), "/tmp/#{fetch(:nginx_ssl_certificate_key)}"

          execute "sudo mv /tmp/#{fetch(:nginx_ssl_certificate)} /etc/ssl/certs/#{fetch(:nginx_ssl_certificate)}"
          execute "sudo mv /tmp/#{fetch(:nginx_ssl_certificate_key)} /etc/ssl/private/#{fetch(:nginx_ssl_certificate_key)}"
        end

        execute "sudo chown root:root /etc/ssl/certs/#{fetch(:nginx_ssl_certificate)}"
        execute "sudo chown root:root /etc/ssl/private/#{fetch(:nginx_ssl_certificate_key)}"
      end
    end
  end

  desc "Reload nginx configuration"
  task :reload do
    on roles(:web) do
      execute "mkdir -p #{shared_path}/log"
      execute "sudo /etc/init.d/nginx reload"
    end
  end

  after "deploy:check", "nginx:setup"
  after "deploy:finished", "nginx:reload"

end

namespace :unicorn do
  desc "Setup Unicorn initializer and app configuration"
  task :setup do
    on roles(:app) do
      execute "mkdir -p #{shared_path}/config"
      execute "mkdir -p #{shared_path}/tmp/pids"
      template "unicorn.rb.erb", fetch(:unicorn_config)
      template "unicorn_init.erb", "/tmp/unicorn_init"
      execute "chmod +x /tmp/unicorn_init"
      execute "sudo mv /tmp/unicorn_init /etc/init.d/unicorn_#{fetch(:application)}"
      execute "sudo update-rc.d -f unicorn_#{fetch(:application)} defaults"
    end
  end

  after "deploy:check", "unicorn:setup"

end

namespace :deploy do
  %w[start stop restart].each do |command|
    desc "#{command} unicorn"
    task command do
      on roles(:app) do
        execute "service unicorn_#{fetch(:application)} #{command}"
      end
    end
  end
  after :publishing, "deploy:restart"
end

desc "Setup logs rotation for nginx and unicorn"
task :logrotate do
  on roles(:web, :app) do
    template("logrotate.erb", "/tmp/#{fetch(:application)}_logrotate")
    execute "sudo mv /tmp/#{fetch(:application)}_logrotate /etc/logrotate.d/#{fetch(:application)}"
    execute "sudo chown root:root /etc/logrotate.d/#{fetch(:application)}"
  end
end

after "deploy:check", "logrotate"

def template(template_name, target)
  config_file = "#{fetch(:templates_path)}/#{template_name}"
  # if no customized file, proceed with default
  unless File.exists?(config_file)
    config_file = File.join(File.dirname(__FILE__), "../../generators/capistrano3/nginx_unicorn/templates/#{template_name}")
  end
  upload! StringIO.new(ERB.new(File.read(config_file)).result(binding)), target
end

