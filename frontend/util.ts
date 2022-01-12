import { Grid, GridColumn, GridDataProvider, GridDataProviderCallback, GridDataProviderParams } from '@vaadin/grid';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-text-field';
import Filter from 'Frontend/generated/com/example/application/data/endpoint/Filter';
import FilterType from 'Frontend/generated/com/example/application/data/endpoint/Filter/FilterType';
import Pageable from 'Frontend/generated/com/vaadin/fusion/mappedtypes/Pageable';
import Sort from 'Frontend/generated/com/vaadin/fusion/mappedtypes/Sort';
import Direction from 'Frontend/generated/org/springframework/data/domain/Sort/Direction';
import { html, render, TemplateResult } from 'lit';
import { directive, Directive, ElementPartInfo, PartInfo, PartType } from 'lit/directive';

interface Fetch<T> {
  (pageable: Pageable | undefined, filters: Filter[]): Promise<ReadonlyArray<T | undefined> | undefined>;
}

export interface GridDataProviderWithFilter<T> extends GridDataProvider<T> {
  filterString(grid: Grid, path: string, value: string): void;
  filterBoolean(grid: Grid, path: string, value: string): void;
}

export const infiniteScrollDataProvider = <T>(dataFetch: Fetch<T>): GridDataProviderWithFilter<T> => {
  const filters: Filter[] = [];

  const dataProvider: GridDataProviderWithFilter<T> = async (
    params: GridDataProviderParams<T>,
    callback: GridDataProviderCallback<T>
  ): Promise<void> => {
    type NewType = Sort;

    const sort: NewType = {
      orders: params.sortOrders.map((order) => ({
        property: order.path,
        direction: order.direction == 'asc' ? Direction.ASC : Direction.DESC,
        ignoreCase: false,
      })),
    };

    const data: Array<T> = (await dataFetch(
      {
        pageNumber: params.page,
        pageSize: params.pageSize,
        sort: sort,
      },
      filters
    )) as Array<T>;

    const firstIndex = params.pageSize * params.page;
    const sizeEstimate = firstIndex + data.length + (data.length > 0 ? 1 : 0);
    callback(data, sizeEstimate);
  };

  const filter = (grid: Grid, filter: Filter) => {
    const existingIndex = filters.findIndex((f) => f.path === filter.path);

    if (filter.value === undefined) {
      if (existingIndex) {
        filters.splice(existingIndex, 1);
        grid.clearCache();
      }
      return;
    }

    if (existingIndex >= 0) {
      // Update existing
      filters[existingIndex].value = filter.value;
    } else {
      filters.push(filter);
    }
    grid.clearCache();
  };

  dataProvider.filterString = (grid: Grid, path: string, value: string | undefined) => {
    filter(grid, { path, value: value === '' ? undefined : value, type: FilterType.STRING });
  };

  dataProvider.filterBoolean = (grid: Grid, path: string, value: string | undefined) => {
    filter(grid, { path, value, type: FilterType.BOOLEAN });
  };

  return dataProvider;
};

export const headerWithFilter = directive(
  class extends Directive {
    partInfo: ElementPartInfo;
    constructor(partInfo: PartInfo) {
      super(partInfo);
      if (partInfo.type !== PartType.ELEMENT) {
        throw new Error('Use as <vaadin-grid-column ${headerWithFilter(...)}></vaadin-grid-column>');
      }
      this.partInfo = partInfo;
    }
    render(
      fieldProvider: (grid: Grid, column: GridColumn, dataProvider: GridDataProviderWithFilter<any>) => TemplateResult
    ) {
      const column = (this.partInfo as any).element as GridColumn;
      if (!column.headerRenderer) {
        column.headerRenderer = headerWithFilterRenderer(fieldProvider);
      }
    }
  }
);

const defaultFilterTextFieldProvider = (
  grid: Grid,
  column: GridColumn,
  dataProvider: GridDataProviderWithFilter<any>
) =>
  html`<vaadin-text-field
    @change=${(e: any) => dataProvider.filterString(grid, column.path!, (e.target! as any).value)}
    @keydown=${(e: KeyboardEvent) => e.stopPropagation()}
  ></vaadin-text-field>`;

const defaultFilterCheckBoxProvider = (grid: Grid, column: GridColumn, dataProvider: GridDataProviderWithFilter<any>) =>
  html`<vaadin-checkbox
    @checked-changed=${(e: Event) => dataProvider.filterBoolean(grid, column.path!, (e.target! as any).checked)}
  ></vaadin-checkbox>`;

export const headerWithTextFieldFilter = directive(
  class extends Directive {
    partInfo: ElementPartInfo;
    constructor(partInfo: PartInfo) {
      super(partInfo);
      if (partInfo.type !== PartType.ELEMENT) {
        throw new Error('Use as <vaadin-grid-column ${headerWithTextFieldFilter(...)}></vaadin-grid-column>');
      }
      this.partInfo = partInfo;
    }
    render() {
      const column = (this.partInfo as any).element as GridColumn;
      if (!column.headerRenderer) {
        column.headerRenderer = headerWithFilterRenderer(defaultFilterTextFieldProvider);
      }
    }
  }
);
export const headerWithCheckboxFilter = directive(
  class extends Directive {
    partInfo: ElementPartInfo;
    constructor(partInfo: PartInfo) {
      super(partInfo);
      if (partInfo.type !== PartType.ELEMENT) {
        throw new Error('Use as <vaadin-grid-column ${headerWithCheckboxFilter(...)}></vaadin-grid-column>');
      }
      this.partInfo = partInfo;
    }
    render() {
      const column = (this.partInfo as any).element as GridColumn;
      if (!column.headerRenderer) {
        column.headerRenderer = headerWithFilterRenderer(defaultFilterCheckBoxProvider);
      }
    }
  }
);

const headerWithFilterRenderer =
  (fieldProvider: (grid: Grid, column: GridColumn, dataProvider: GridDataProviderWithFilter<any>) => TemplateResult) =>
  (root: HTMLElement, column: GridColumn) => {
    const grid: Grid = (column as any)._grid;

    render(
      html`
        <div style="display: flex;flex-direction:column">
          <vaadin-grid-sorter style="align-self: start" path="${column.path!}"
            >${(column as any)._generateHeader(column.path)}</vaadin-grid-sorter
          >
          ${fieldProvider(grid, column, grid.dataProvider as GridDataProviderWithFilter<any>)}
        </div>
      `,
      root
    );
  };
