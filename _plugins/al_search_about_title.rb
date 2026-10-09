# Gives the home page a search entry title when its page has none.
#
# The about page leaves `title:` empty so the navbar shows no "about" link, but
# al_search builds the Cmd-K home entry from that title. An empty one produces a
# blank search entry and an "Empty `slug` generated" warning on every page.
#
# This renders the gem's own template with one line patched to fall back to
# "about", so the rest of the template keeps tracking gem updates. `render`
# mirrors AlSearch::SearchAssetsTag#render (al_search 1.0.3) apart from that.
# Delete once https://github.com/al-org-dev/al-search/pull/20 is released.

# Jekyll loads _plugins before the gems in `plugins:`, so load the gem first.
require 'al_search'

module AlSearchAboutTitle
  FIND = '| map: "title" | first | strip'
  REPLACE = '| map: "title" | first | strip | default: "about"'

  def self.template
    @template ||= begin
      path = File.join(Gem.loaded_specs.fetch('al_search').full_gem_path, 'lib/templates/search-data.liquid.js')
      source = File.read(path)
      unless source.include?(FIND)
        Jekyll.logger.warn 'AlSearchAboutTitle:', 'al_search template changed; home title fallback not applied'
      end
      Liquid::Template.parse(source.sub(FIND, REPLACE))
    end
  end

  def render(context)
    site = context.registers[:site]
    return '' unless site
    return '' unless site.config['search_enabled']

    baseurl = site.config['baseurl'] || ''
    payload = site.site_payload
    payload['page'] = context.registers[:page] || {}
    payload['paginator'] = context['paginator'] if context['paginator']

    search_data = AlSearchAboutTitle.template.render(payload, registers: context.registers)

    <<~HTML
      <script type="module" src="#{baseurl}/assets/al_search/js/search/ninja-keys.min.js"></script>
      <ninja-keys hideBreadcrumbs noAutoLoadMdIcons placeholder="Type to start searching"></ninja-keys>
      <script src="#{baseurl}/assets/al_search/js/search-setup.js"></script>
      <script>
      #{search_data}
      </script>
      <script src="#{baseurl}/assets/al_search/js/shortcut-key.js"></script>
    HTML
  end
end

AlSearch::SearchAssetsTag.prepend(AlSearchAboutTitle)
