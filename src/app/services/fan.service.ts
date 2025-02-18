import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { profile } from "./profiles";
import { invoke } from "@tauri-apps/api/core";

@Injectable({
  providedIn: "root",
})
export class FanService {
  private mode_index = new BehaviorSubject(1);
  getIndex = this.mode_index.asObservable();

  setMode(index: number) {
    this.mode_index.next(index);
  }

  //fan profiles
  public profiles_list: profile[] = this.boot();

  boot(): profile[] {
    invoke("get_json").then((res) => {
      this.profiles_list = JSON.parse(res as string);
    });
    return this.profiles_list;
  }
  getProfiles(): profile[] {
    return this.profiles_list;
  }

  getProfileArrayByName(name: string) {
    return this.profiles_list.find((profile) => profile.name === name);
  }

  getProfileByIndex(index: number) {
    return this.profiles_list[index];
  }

  getProfileIndexByName(name: string) {
    let objIndex = -1;
    for (let i = 0; i < this.profiles_list.length; i++) {
      if (this.profiles_list[i].name === name) {
        objIndex = i;
        return objIndex;
        break;
      }
    }
    return -1;
  }

  addProfile(name: string) {
    let id = 0;
    for (const key in this.profiles_list) {
      this.profiles_list[key].id == id++;
    }
    const newProfile = {
      id: id,
      name: name,
      array: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100, 100, 100],
      selected: false,
      disabled: true,
      class: "transparent",
      img_class: "btn-outline-info",
      img: "\uF4CB",
    };
    this.profiles_list.push(newProfile);
    const jsonString = JSON.stringify(this.profiles_list);
    invoke("local_storage", {
      function: "save",
      option: "profiles",
      value: jsonString,
    });
  }

  editProfileName(i: number, name: string) {
    this.profiles_list[i].name = name;
    this.save_to_rust();
  }

  editFanCurves(i: number, array: any) {
    this.profiles_list[i].array = array;
    this.save_to_rust();
  }

  saveSelected(index: number) {
    for (let i = 0; i < this.profiles_list.length; i++) {
      this.profiles_list[i].selected = false;
    }
    this.profiles_list[index].selected = true;
    this.save_to_rust();
  }

  getSelected() {
    for (let i = 0; i < this.profiles_list.length; i++) {
      if (this.profiles_list[i].selected === true) {
        return [this.profiles_list[i].name, this.profiles_list[i].array];
      }
    }
    return " ";
  }

  deleteProfile(i: number) {
    this.profiles_list.splice(i, 1);
    this.save_to_rust();
  }

  save_to_rust() {
    invoke("local_storage", {
      function: "save",
      option: "profiles",
      value: JSON.stringify(this.profiles_list),
    });
  }
}
