import {Component, inject, input, InputSignal, signal, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Rule} from '../../../models/header-modder.models';
import {StorageService} from '../../../services/storage.service';
import {AddRuleComponent} from '../../add-rule/add-rule';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';

import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';
import {StopPropagationOnClickDirective} from '../../../directives/stop-propagation-on-click.directive';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-rule-item',
  imports: [FormsModule, AddRuleComponent, MatCheckbox, MatMenu, MatMenuItem, MatMenuTrigger, MatIconButton, StopPropagationOnClickDirective, MatTooltip],
  templateUrl: './rule-item.html',
  styleUrl: './rule-item.scss'
})
export class RuleItemComponent {

  private readonly storage: StorageService = inject(StorageService);

  // INPUTS
  public readonly groupId: InputSignal<string> = input.required();
  public readonly rule: InputSignal<Rule> = input.required();
  public readonly groupDisabled: InputSignal<boolean> = input.required();

  protected readonly editing: WritableSignal<boolean> = signal(false);
  protected readonly confirmingDelete: WritableSignal<boolean> = signal(false);

  protected readonly onToggle: (event: MatCheckboxChange) => void = (event: MatCheckboxChange): void => {
    this.storage.toggleRule(this.groupId(), this.rule().id, event.checked);
  };

  protected startEdit = (): void => this.editing.set(true);

  protected cancelEdit = (): void => this.editing.set(false);

  protected onDelete = (): void => {
    if (!this.confirmingDelete()) {
      this.confirmingDelete.set(true);
      setTimeout(() => this.confirmingDelete.set(false), 2000);
    } else {
      this.storage.deleteRule(this.groupId(), this.rule().id);
    }
  };
}
