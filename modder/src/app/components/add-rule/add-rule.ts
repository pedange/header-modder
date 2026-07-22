import {Component, computed, effect, inject, input, InputSignal, output, OutputEmitterRef, Signal, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FieldTree, form, FormField, required} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {StorageService} from '../../services/storage.service';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {Rule} from '../../models/header-modder.models';

@Component({
  selector: 'app-add-rule',
  imports: [FormsModule, MatButton, FormField, MatInput, MatFormField, MatLabel],
  templateUrl: './add-rule.html',
  styleUrl: './add-rule.scss'
})
export class AddRuleComponent {

  private readonly storage: StorageService = inject(StorageService);

  // INPUTS
  public readonly groupId: InputSignal<string> = input.required<string>();
  /** If provided, the component operates in "Edit" mode. */
  public readonly rule: InputSignal<Rule | undefined> = input<Rule | undefined>();

  // OUTPUTS
  /** Emitted when the form should be dismissed (after a successful add/update, or on cancel). */
  public readonly closed: OutputEmitterRef<void> = output<void>();

  protected readonly ruleForm: FieldTree<RuleForm> = form(signal<RuleForm>({
    header: '',
    value: '',
    comment: ''
  }), (path) => {
    required(path.header);
    required(path.value);
  });

  constructor() {
    effect(() => {
      const r = this.rule();
      this.ruleForm().value.set({
        header: r?.header ?? '',
        value: r?.value ?? '',
        comment: r?.comment ?? ''
      });
    });
  }

  public readonly formValid: Signal<boolean> = computed(() => this.ruleForm().valid());

  protected readonly save = (): void => {
    if (this.formValid()) {
      const rule: Rule | undefined = this.rule();
      const {header, value, comment} = this.ruleForm().value();
      if (rule) {
        this.storage.updateRule(this.groupId(), rule.id, header, value, comment);
      } else {
        this.storage.addRule(this.groupId(), header, value, comment);
      }
      this.closed.emit();
    }
  };

  protected readonly cancel = (): void => this.closed.emit();
}

type RuleForm = {
  header: string;
  value: string;
  comment: string;
};
