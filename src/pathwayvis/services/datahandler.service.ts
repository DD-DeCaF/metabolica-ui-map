import * as Rx from 'rxjs/Rx';

// What if multiple instances live next to each other?
const nextIdGen = (): () => number => {
  let id = 0;
  return (): number => id++;
};

enum direction {
  prev = -1,
  next = 1,
}

// TODO: add select by Id
// TODO: make sure remove is not called when there are less than 2 items
export class DataHandlerService<T> {
  private addSubject: Rx.Subject<T> = new Rx.Subject();
  private removeSubject: Rx.Subject<number> = new Rx.Subject();
  private stepSubject: Rx.Subject<direction> = new Rx.Subject();
  private cardsById: Rx.Observable<Map<number, T>>;
  private nextId = nextIdGen();

  public selectedId: Rx.Observable<number>;
  public selectedCard: Rx.Observable<T> = Rx.Observable.combineLatest(
    this.selectedId,
    this.cardsById,
    (selectedId, cardsById) => cardsById.get(selectedId),
  );

  public allCards: Rx.Observable<{id: number, item: T}[]>;

  constructor() {
    const add = this.addSubject.map((dataCard) => (cardsById: Map<number, T>) => {
      const cardsByIdCopy = new Map(cardsById);
      cardsByIdCopy.set(this.nextId(), dataCard);
      console.log('add', Array.from(cardsByIdCopy));
      return cardsByIdCopy;
    });

    const remove = this.removeSubject.map((cardId) => (cardsById: Map<number, T>) => {
      console.log('remove', Array.from(cardsById));
      if (cardsById.size < 2) {
        throw new Error('You can\'t remove elements if there are less than 2 elements');
      }
      const cardsByIdCopy = new Map(cardsById);
      cardsByIdCopy.delete(cardId);
      return cardsByIdCopy;
    });

    this.cardsById = Rx.Observable
      .merge(remove, add)
      .scan(
        (accumulator, func) => func(accumulator),
        <Map<number, T>> new Map(),
      );

    this.allCards = this.cardsById
      .map((cardsById) =>
        Array.from(cardsById.keys()).sort()
          .map((id) => ({id, item: cardsById.get(id)})),
    // ).publish();
    // this.allCards.connect();

    // ).shareReplay(1);

    ).share();

    this.selectedId = Rx.Observable.combineLatest(
      Rx.Observable.merge(
        this.removeSubject.map((cardId: number) => (prevSelectedCardId: number, cardsById: Map<number, T>) => {
          if (prevSelectedCardId !== cardId) {
            return cardId;
          }
          const keys = Array.from(cardsById.keys());
          // find === findFirst
          let id = keys.find((index) => index > cardId);
          if (!id) {
            // What if it's an empty list? - I think it can't be.
            id = keys[0];
          }
          return id;
        }),
        this.stepSubject.map((step) => (prevSelectedCardId: number, cardsById: Map<number, T>) => {
          const keys = Array.from(cardsById.keys());
          const prevIndex = keys.findIndex((index) => index === prevSelectedCardId);
          return keys[(keys.length + prevIndex + step) % keys.length];
        }),
      ),
      this.cardsById,
      (func, cardsById) => ({func, cardsById}),
    ).scan((accumulator, {func, cardsById}) => func(accumulator, cardsById), 0);
  }

  public add(dataCard: T): void {
    this.addSubject.next(dataCard);
  }

  public remove(cardId: number): void {
    this.removeSubject.next(cardId);
  }

  public next(): void {
    this.stepSubject.next(direction.next);
  }

  public previous(): void {
    this.stepSubject.next(direction.prev);
  }
}
