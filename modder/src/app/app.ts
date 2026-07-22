import {Component, ElementRef, inject, signal, viewChild, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Group, ImportSelection} from './models/header-modder.models';
import {StorageService} from './services/storage.service';
import {GroupItemComponent} from './components/group-item/group-item';
import {AddGroupComponent} from './components/add-group/add-group';
import {ImportSelectionComponent} from './components/import-selection/import-selection';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector: 'app-root',
  imports: [FormsModule, GroupItemComponent, AddGroupComponent, ImportSelectionComponent, MatButton, MatMenuTrigger, MatMenu, MatMenuItem, MatIconButton],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly storage = inject(StorageService);

  protected readonly groups: WritableSignal<Group[]> = this.storage.groups;

  protected readonly showAddGroup: WritableSignal<boolean> = signal(false);
  protected readonly settingsMenuOpen: WritableSignal<boolean> = signal(false);
  protected readonly importSelectionOpen: WritableSignal<boolean> = signal(false);
  protected readonly pendingImport: WritableSignal<ImportSelection[]> = signal([]);

  private readonly importInput = viewChild.required<ElementRef<HTMLInputElement>>('importInput');

  protected openAddGroup(): void {
    this.showAddGroup.set(true);
  }

  protected export(): void {
    this.settingsMenuOpen.set(false);
    const data = JSON.stringify(this.storage.exportData(), null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);

    const a = document.createElement('a');
    a.href = url;
    a.download = `header-modder-export-${date}.json`;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  protected triggerImport(): void {
    this.settingsMenuOpen.set(false);
    this.importInput().nativeElement.click();
  }

  protected onImportFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        let importedGroups: Group[] = [];

        if (Array.isArray(importedData)) {
          // Old format: just an array of groups
          importedGroups = importedData;
        } else if (importedData && Array.isArray(importedData.groups)) {
          // New format: object with groups property
          importedGroups = importedData.groups;
          console.log(`Importing data from version: ${importedData.version || 'unknown'}`);
        } else {
          alert('Invalid file format: Expected an array of groups or a versioned export object.');
          return;
        }

        if (importedGroups.length === 0) {
          alert('No groups found in the imported file.');
          return;
        }

        this.pendingImport.set(importedGroups.map(group => ({group, selected: true})));
        this.importSelectionOpen.set(true);
      } catch (err) {
        alert('Error parsing JSON file.');
        console.error(err);
      }
      // Reset input so the same file can be selected again
      input.value = '';
    };
    reader.readAsText(file);
  }

  protected closeImport(): void {
    this.importSelectionOpen.set(false);
    this.pendingImport.set([]);
  }
}
