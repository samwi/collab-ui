import { Component } from '@angular/core';
import { AlertMeetingService } from '@collab-ui/angular';

@Component({
  selector: 'example-alert-meeting-default',
  template: `
    <button cui-button (click)="onClick()" aria-label="Click to Open">Default</button>
  `,
})
export class ExampleAlertMeetingDefaultComponent {
  constructor(private alertMeetingService: AlertMeetingService) {}

  onClick() {
    this.alertMeetingService.show({
      title: 'Important Meeting',
      message: 'This is important',
      status: 'In 5 mins.',
      attendees: [{title: 'J $'}],
      onClick: () => {},
      onHide: () => {},
      onSnooze: () => {},
    });
  }
}
