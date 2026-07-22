import {Component, computed, effect, inject, input, InputSignal, output, OutputEmitterRef, Signal, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FieldTree, form, FormField, required} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {StorageService} from '../../services/storage.service';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Group} from '../../models/header-modder.models';

@Component({
  selector: 'app-add-group',
  imports: [FormsModule, MatButton, FormField, MatInput, MatFormField, MatLabel],
  templateUrl: './add-group.html',
  styleUrl: './add-group.scss'
})
export class AddGroupComponent {

  private readonly storage: StorageService = inject(StorageService);

  // INPUTS
  /** If provided, the component operates in "Edit" mode. */
  public readonly group: InputSignal<Group> = input<Group>();

  // OUTPUTS
  /** Emitted when the form should be dismissed (after a successful add/update, or on cancel). */
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly groupForm: FieldTree<GroupForm> = form(signal<GroupForm>({
    name: '',
    urlPattern: 'https://*'
  }), (path) => {
    required(path.name);
    required(path.urlPattern);
  });

  constructor() {
    effect(() => {
      this.groupForm().value.set({
        name: this.group()?.name ?? '',
        urlPattern: this.group()?.urlPattern ?? 'https://*'
      });
    });
  }

  public readonly formValid: Signal<boolean> = computed(() => this.groupForm().valid());

  protected readonly save = (): void => {
    if (this.formValid()) {
      const group: Group = this.group();
      const {name, urlPattern} = this.groupForm().value();
      if (group) {
        this.storage.updateGroup(group.id, name, urlPattern);
      } else {
        this.storage.addGroup(name, urlPattern);
      }
      this.closed.emit();
    }
  };

  protected readonly cancel = (): void => this.closed.emit();
}

type GroupForm = {
  name: string;
  urlPattern: string;
};
