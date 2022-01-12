import '@polymer/iron-icon';
import '@vaadin/button';
import '@vaadin/date-picker';
import '@vaadin/date-time-picker';
import { Binder } from '@vaadin/form';
import '@vaadin/form-layout';
import { EndpointError } from '@vaadin/fusion-frontend';
import '@vaadin/grid';
import { Grid } from '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-filter';
import '@vaadin/grid/vaadin-grid-sort-column';
import '@vaadin/horizontal-layout';
import '@vaadin/notification';
import { Notification } from '@vaadin/notification';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/split-layout';
import '@vaadin/text-field';
import '@vaadin/upload';
import '@vaadin/vaadin-icons';
import SamplePerson from 'Frontend/generated/com/example/application/data/entity/SamplePerson';
import SamplePersonModel from 'Frontend/generated/com/example/application/data/entity/SamplePersonModel';
import * as SamplePersonEndpoint from 'Frontend/generated/SamplePersonEndpoint';
import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { View } from '../view';
import { headerWithCheckboxFilter, headerWithTextFieldFilter, infiniteScrollDataProvider } from '../../util';

@customElement('hello-world-view')
export class HelloWorldView extends View {
  @query('#grid')
  private grid!: Grid;

  @property({ type: Number })
  private gridSize = 0;

  private gridDataProvider = infiniteScrollDataProvider(SamplePersonEndpoint.list);

  private binder = new Binder<SamplePerson, SamplePersonModel>(this, SamplePersonModel);

  render() {
    return html`
      <vaadin-split-layout class="w-full h-full">
        <div class="flex-grow w-full">
          <vaadin-grid
            id="grid"
            class="w-full h-full"
            theme="no-border"
            .size=${this.gridSize}
            .dataProvider=${this.gridDataProvider}
            @active-item-changed=${this.itemSelected}
          >
            <vaadin-grid-column auto-width path="firstName" .headerRenderer=${headerWithTextFieldFilter}> </vaadin-grid-column>
            <vaadin-grid-column auto-width path="lastName" .headerRenderer=${headerWithTextFieldFilter}> </vaadin-grid-column>
            <vaadin-grid-column auto-width path="email" .headerRenderer=${headerWithTextFieldFilter}> </vaadin-grid-column>

            <vaadin-grid-column auto-width path="important" .headerRenderer=${headerWithCheckboxFilter}
              ><template
                ><iron-icon
                  hidden="[[!item.important]]"
                  icon="vaadin:check"
                  style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s); color: var(--lumo-primary-text-color);"
                >
                </iron-icon>
                <iron-icon
                  hidden="[[item.important]]"
                  icon="vaadin:minus"
                  style="width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s); color: var(--lumo-disabled-text-color);"
                >
                </iron-icon></template
            ></vaadin-grid-column>
            <vaadin-grid-sort-column auto-width path="phone"></vaadin-grid-sort-column>
            <vaadin-grid-sort-column auto-width path="dateOfBirth"></vaadin-grid-sort-column>
            <vaadin-grid-sort-column auto-width path="occupation"></vaadin-grid-sort-column>
          </vaadin-grid>
        </div>
      </vaadin-split-layout>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    this.classList.add('flex', 'flex-col', 'h-full');
    this.gridSize = (await SamplePersonEndpoint.count()) ?? 0;
  }

  private async itemSelected(event: CustomEvent) {
    const item: SamplePerson = event.detail.value as SamplePerson;
    this.grid.selectedItems = item ? [item] : [];

    if (item) {
      const fromBackend = await SamplePersonEndpoint.get(item.id!);
      fromBackend ? this.binder.read(fromBackend) : this.refreshGrid();
    } else {
      this.clearForm();
    }
  }

  private async save() {
    try {
      const isNew = !this.binder.value.id;
      await this.binder.submitTo(SamplePersonEndpoint.update);
      if (isNew) {
        // We added a new item
        this.gridSize++;
      }
      this.clearForm();
      this.refreshGrid();
      Notification.show(`SamplePerson details stored.`, { position: 'bottom-start' });
    } catch (error: any) {
      if (error instanceof EndpointError) {
        Notification.show(`Server error. ${error.message}`, { theme: 'error', position: 'bottom-start' });
      } else {
        throw error;
      }
    }
  }

  private cancel() {
    this.grid.activeItem = undefined;
  }

  private clearForm() {
    this.binder.clear();
  }

  private refreshGrid() {
    this.grid.selectedItems = [];
    this.grid.clearCache();
  }
}
