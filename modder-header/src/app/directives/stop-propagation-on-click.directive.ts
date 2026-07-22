import {Directive, HostListener} from '@angular/core';

@Directive({
    selector: '[stopPropagationOnClick]',
    standalone: true
})
export class StopPropagationOnClickDirective {

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent): void {
        event.stopPropagation();
    }

}
