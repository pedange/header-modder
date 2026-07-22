import {Component, computed, effect, inject, input, InputSignal, output, OutputEmitterRef, Signal, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FieldTree, form, FormField, RootFieldContext, validate} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {Group, ImportSelection} from '../../models/header-modder.models';
import {StorageService} from '../../services/storage.service';

@Component({
  selector: 'app-import-selection',
  imports: [FormsModule, MatButton, MatCheckbox, FormField],
  templateUrl: './import-selection.html',
  styleUrl: './import-selection.scss'
})
export class ImportSelectionComponent {

  private readonly storage: StorageService = inject(StorageService);

  // INPUTS
  public readonly pendingImport: InputSignal<ImportSelection[]> = input.required();

  // OUTPUTS
  public readonly closed: OutputEmitterRef<void> = output();

  protected readonly importForm: FieldTree<ImportForm> = form(signal<ImportForm>({
    items: [],
    replaceExisting: false
  }), (path) => {
    validate(path.items, (context: RootFieldContext<ImportForm['items']>) => {
      const selected: boolean = context.value().some((item: ImportForm['items'][number]) => item.selected);
      return selected ? null : {
        kind: 'noSelection',
        message: 'Please select at least one group to import.'
      };
    });
  });

  protected readonly formValid: Signal<boolean> = computed(() => this.importForm().valid());

  constructor() {
    effect(() => {
      const pending: ImportSelection[] = this.pendingImport();
      this.importForm().value.set({
        items: pending.map((item: ImportSelection) => ({
          id: item.group.id,
          selected: item.selected
        })),
        replaceExisting: false
      });
    });
  }

  protected confirmImport = (): void => {
    if (!this.formValid()) {
      return;
    }

    const formValue = this.importForm().value();
    const selectedIds = new Set(
      formValue.items
        .filter(item => item.selected)
        .map(item => item.id)
    );

    const selectedGroups: Group[] = this.pendingImport()
      .filter((item: ImportSelection) => selectedIds.has(item.group.id))
      .map((item: ImportSelection) => item.group);

    if (formValue.replaceExisting) {
      this.storage.replaceGroups(selectedGroups);
    } else {
      this.storage.appendGroups(selectedGroups);
    }

    this.closed.emit();
  };

  protected cancelImport(): void {
    this.closed.emit();
  }
}

type ImportForm = {
  items: { id: string; selected: boolean }[];
  replaceExisting: boolean;
};
