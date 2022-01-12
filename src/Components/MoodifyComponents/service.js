import http from "./http-common";

class DataService_Moodify {

    // Test playlist 37i9dQZF1DXdPec7aLTmlC
  getPlaylist(playlist_id, header) {
    return http.get("/playlists/" + {playlist_id});
  }

//   get(id) {
//     return http.get(`/users/${id}`);
//   }

//   create(data) {
//     return http.post("/users", data);
//   }

//   auth(data) {
//       return http.post("/users/auth", data);
//   }

//   update(id, data) {
//     return http.put(`/users/${id}`, data);
//   }

//   delete(id) {
//     return http.delete(`/users/${id}`);
//   }

//   deleteAll() {
//     return http.delete(`/users`);
//   }

}

export default new DataService_Moodify();