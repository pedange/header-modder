import {Component, inject, input, InputSignal, signal, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Group} from '../../models/header-modder.models';
import {StorageService} from '../../services/storage.service';
import {RuleItemComponent} from './rule-item/rule-item';
import {AddGroupComponent} from '../add-group/add-group';
import {AddRuleComponent} from '../add-rule/add-rule';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {StopPropagationOnClickDirective} from '../../directives/stop-propagation-on-click.directive';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';

@Component({
  selector: 'app-group-item',
  imports: [FormsModule, RuleItemComponent, AddGroupComponent, AddRuleComponent, MatButton, MatMenuTrigger, MatMenu, MatMenuItem, StopPropagationOnClickDirective, MatIconButton, MatCheckbox],
  templateUrl: './group-item.html',
  styleUrl: './group-item.scss'
})
export class GroupItemComponent {

  private readonly storage: StorageService = inject(StorageService);

  // INPUTS
  public readonly group: InputSignal<Group> = input.required();

  protected readonly expanded: WritableSignal<boolean> = signal(false);
  protected readonly editingGroup: WritableSignal<boolean> = signal(false);
  protected readonly addingRule: WritableSignal<boolean> = signal(false);
  protected readonly confirmingDelete: WritableSignal<boolean> = signal(false);

  protected activeRuleCount(): number {
    return this.group().rules.filter(r => r.enabled).length;
  }

  /** Toggle expansion, but ignore clicks that land on the action controls. */
  protected onHeaderClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.group-actions') || target.closest('.group-toggle') || target.closest('.group-menu-container')) {
      return;
    }
    this.expanded.update(v => !v);
  }

  protected onGroupToggle = (event: MatCheckboxChange): void => this.storage.toggleGroup(this.group().id, event.checked);

  protected startEditGroup(): void {
    this.editingGroup.set(true);
    this.expanded.set(true);
  }

  protected onDeleteGroup(): void {
    if (!this.confirmingDelete()) {
      this.confirmingDelete.set(true);
      setTimeout(() => this.confirmingDelete.set(false), 2000);
    } else {
      this.storage.deleteGroup(this.group().id);
    }
  }

  protected toggleAddRule(): void {
    this.addingRule.update(v => !v);
    if (this.addingRule()) {
      this.expanded.set(true);
    }
  }
}
