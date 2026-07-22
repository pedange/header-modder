import {effect, Injectable, signal} from '@angular/core';
import {ExportData, Group, Rule} from '../models/header-modder.models';

/**
 * Single source of truth for the extension's groups.
 *
 * State is persisted to `chrome.storage.local`; writing there is also what
 * drives the background service worker (via `chrome.storage.onChanged`) to
 * rebuild the dynamic declarativeNetRequest rules.
 */
@Injectable({providedIn: 'root'})
export class StorageService {

  public readonly groups = signal<Group[]>([]);

  /** The chrome extension APIs, or undefined outside the extension (e.g. unit tests). */
  private readonly chromeApi = typeof chrome !== 'undefined' ? chrome : undefined;

  constructor() {
    // Initialize groups from storage
    if (this.chromeApi?.storage) {
      this.chromeApi?.storage?.local.get(['groups'], (result: { [key: string]: unknown }) => {
        if (result['groups']) {
          this.groups.set(result['groups'] as Group[]);
        }
      });
    } else {
      console.log('StorageService: Using localStorage');
      this.groups.set(JSON.parse(localStorage.getItem('groups') ?? '[]'));
    }

    // Save groups on change
    effect(() => {
      if (this.chromeApi?.storage) {
        this.chromeApi?.storage?.local.set({groups: this.groups()});
      } else {
        localStorage.setItem('groups', JSON.stringify(this.groups()));
      }
    });
  }

  /** App/extension version, read from the manifest. */
  public get version(): string {
    return this.chromeApi?.runtime?.getManifest().version ?? '0.0.0';
  }

  public readonly addGroup = (name: string, urlPattern: string): void => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      urlPattern,
      enabled: true,
      rules: []
    };
    this.groups.update((current: Group[]) => [...current, newGroup]);
  };

  public readonly updateGroup = (id: string, name: string, urlPattern: string): void => {
    this.groups.update((current: Group[]) => current.map((g: Group) => (g.id === id ? {...g, name, urlPattern} : g)));
  };

  public readonly deleteGroup = (id: string): void => {
    this.groups.update((current: Group[]) => current.filter((g: Group) => g.id !== id));
  };

  public readonly toggleGroup = (id: string, enabled: boolean): void => {
    this.groups.update((current: Group[]) => current.map((g: Group) => (g.id === id ? {...g, enabled} : g)));
  };

  public readonly addRule = (groupId: string, header: string, value: string, comment: string): void => {
    const newRule: Rule = {
      id: Date.now().toString(),
      header,
      value,
      comment,
      enabled: true
    };
    this.groups.update((current: Group[]) => current.map((g: Group) => (g.id === groupId ? {...g, rules: [...g.rules, newRule]} : g)));
  };

  public readonly updateRule = (groupId: string, ruleId: string, header: string, value: string, comment: string): void => {
    this.groups.update((current: Group[]) => current.map((g: Group) => (g.id === groupId ? {...g, rules: g.rules.map((r: Rule) => r.id === ruleId ? {...r, header, value, comment} : r)} : g)));
  };

  public readonly deleteRule = (groupId: string, ruleId: string): void => {
    this.groups.update((current: Group[]) => current.map((g: Group) => (g.id === groupId ? {...g, rules: g.rules.filter((r: Rule) => r.id !== ruleId)} : g)));
  };

  public readonly toggleRule = (groupId: string, ruleId: string, enabled: boolean): void => {
    this.groups.update((current: Group[]) => current.map((g: Group) => (g.id === groupId ? {...g, rules: g.rules.map((r: Rule) => r.id === ruleId ? {...r, enabled} : r)} : g)));
  };

  /** Give imported groups fresh ids so they never collide with existing ones. */
  private readonly withFreshIds = (groups: Group[]): Group[] => groups.map((group: Group) => ({
    ...group,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }));

  public readonly replaceGroups = (groups: Group[]): void => {
    this.groups.set([...this.withFreshIds(groups ?? [])]);
  };

  public readonly appendGroups = (groups: Group[]): void => {
    this.groups.update((current: Group[]) => [...current, ...this.withFreshIds(groups ?? [])]);
  };

  public readonly exportData = (): ExportData => ({
    version: this.version,
    exportedAt: new Date().toISOString(),
    groups: this.groups()
  });
}
