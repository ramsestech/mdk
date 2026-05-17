import { readFileSync } from 'fs';
import { join } from 'path';

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (m, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : m
  );
}

export function loadTemplate(name: string): string {
  const path = join(__dirname, 'templates', name);
  return readFileSync(path, 'utf8');
}

export function renderTemplate(name: string, vars: Record<string, string>): string {
  return interpolate(loadTemplate(name), vars);
}
