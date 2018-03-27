// Copyright 2018 Novo Nordisk Foundation Center for Biosustainability, DTU.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export class SharedService {
  private loading: number = 0;

  public increment(message?): void {
    this.loading++;
    if (message) {
      console.debug(`increment ${message}`);
    }
  }

  public async(promise, message?): Promise<any> {
    this.increment(message);
    promise.finally(() => {
      this.decrement(message);
    });
    return promise;
  }

  public decrement(message?): void {
    this.loading--;
    if (message) {
      console.debug(`decrement ${message}`);
    }
  }

  public getLoading(): number {
    return this.loading;
  }

  public isLoading(): boolean {
    return this.loading > 0;
  }
}
