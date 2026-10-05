# Opt in to the Rails 8.1 `to_time` behaviour now, which also silences its deprecation
# warning during builds.
require "active_support"

ActiveSupport.to_time_preserves_timezone = :zone
