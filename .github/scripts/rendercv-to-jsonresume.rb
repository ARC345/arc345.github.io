#!/usr/bin/env ruby
# frozen_string_literal: true

# Converts a rendercv source YAML (as published in ARC345/resume releases)
# into the JSON Resume shape consumed by _layouts/cv.liquid.
#
# Usage: ruby rendercv-to-jsonresume.rb <input.source.yaml> <output.json>

require "date"
require "json"
require "yaml"

MONTHS = Date::ABBR_MONTHNAMES.compact.each_with_index.to_h { |m, i| [m.downcase, i + 1] }

# rendercv highlights use a small markdown subset: **bold** and [text](url).
def md(text)
  text.to_s
      .gsub(/\*\*(.+?)\*\*/, '<strong>\1</strong>')
      .gsub(/\[([^\]]+)\]\(([^)]+)\)/, '<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>')
end

def date_str(value)
  return nil if value.nil? || value.to_s.strip.empty? || value.to_s.downcase == "present"

  value.respond_to?(:strftime) ? value.strftime("%Y-%m") : value.to_s
end

# rendercv entries carry either start_date/end_date or a single `date`.
def dates(entry)
  start = date_str(entry["start_date"] || entry["date"])
  finish = entry.key?("start_date") ? date_str(entry["end_date"]) : start
  { "startDate" => start, "endDate" => finish }.compact
end

# "Feb 2026" -> "2026-02"
def month_year(text)
  month, year = text.to_s.split
  num = MONTHS[month.to_s[0, 3].downcase]
  num && year ? format("%s-%02d", year, num) : text.to_s
end

input, output = ARGV
abort "usage: #{$PROGRAM_NAME} <input.source.yaml> <output.json>" unless input && output

cv = YAML.safe_load_file(input, permitted_classes: [Date])["cv"]
sections = cv["sections"] || {}

basics = {
  "name" => cv["name"],
  "label" => cv["headline"],
  "email" => cv["email"],
  "phone" => cv["phone"],
  "url" => cv["website"],
  "location" => cv["location"],
  "summary" => Array(sections["research_interests"]).join(" "),
  "profiles" => Array(cv["social_networks"]).map { |s| { "network" => s["network"], "username" => s["username"] } },
}.reject { |_, v| v.nil? || v == "" }

work = Array(sections["experience"]).map do |e|
  {
    "name" => e["company"],
    "position" => e["position"],
    "location" => e["location"].to_s.empty? ? nil : e["location"],
    "highlights" => Array(e["highlights"]).map { |h| md(h) },
  }.merge(dates(e)).compact
end

education = Array(sections["education"]).map do |e|
  {
    "institution" => e["institution"],
    "area" => e["area"],
    "studyType" => e["degree"],
    "courses" => Array(e["highlights"]).map { |h| md(h) },
  }.merge(dates(e)).compact
end

projects = Array(sections["projects"]).map do |e|
  { "name" => e["name"], "highlights" => Array(e["highlights"]).map { |h| md(h) } }.merge(dates(e))
end

publications = Array(sections["technical_writing"]).map do |e|
  label = e["label"].to_s
  url = label[/\]\(([^)]+)\)/, 1]
  {
    "name" => label.sub(/\s*\(\[[^\]]*\]\([^)]*\)\)\s*\z/, "").strip,
    "url" => url,
    "publisher" => "Blog",
    "releaseDate" => month_year(e["details"]),
  }.compact
end

skills = Array(sections["skills"]).map do |e|
  { "name" => e["label"], "keywords" => e["details"].to_s.split(",").map(&:strip) }
end

# Key order is the section order on the /cv/ page.
resume = {
  "basics" => basics,
  "work" => work,
  "education" => education,
  "projects" => projects,
  "publications" => publications,
  "skills" => skills,
}

File.write(output, JSON.pretty_generate(resume) + "\n")
puts "Wrote #{output} (#{resume.map { |k, v| "#{k}: #{v.is_a?(Array) ? v.size : 1}" }.join(', ')})"
