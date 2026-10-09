# Lets a site file at assets/al_charts/js/<name>.js replace the al_charts gem's copy.
#
# al_charts publishes its setup scripts as static files at that same URL. Both files
# get written to _site and the gem's, added later, wins, so without this the site's
# override would be silently overwritten.
module AlChartsOverrides
  class Generator < Jekyll::Generator
    safe true
    priority :lowest

    def generate(site)
      return unless defined?(AlCharts::PluginStaticFile)

      site.static_files.reject! do |file|
        file.is_a?(AlCharts::PluginStaticFile) &&
          File.exist?(site.in_source_dir(file.relative_path))
      end
    end
  end
end
