LavaPack.loadBundle([
["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\vendor\\trezor\\content-script.js", {}, function(){
  with (this.scopeTerminator) {
  with (this.globalThis) {
    return function() {
      'use strict';
      // source: C:%5CUsers%5Cforth%5CDesktop%5Cmetamaskclone%5Cmetamask-extension-develop%5Capp%5Cvendor%5Ctrezor%5Ccontent-script.js
      return function (require, module, exports) {
"use strict";

/*
Passing messages from background script to popup
*/

let port = chrome.runtime.connect({
  name: 'trezor-connect'
});
port.onMessage.addListener(message => {
  window.postMessage(message, window.location.origin);
});
port.onDisconnect.addListener(d => {
  port = null;
});

/*
Passing messages from popup to background script
*/

window.addEventListener('message', event => {
  if (port && event.source === window && event.data) {
    port.postMessage({
      data: event.data
    });
  }
});

      };
    };
  }
  }
}, {package:"$root$",file:"app\\vendor\\trezor\\content-script.js",}]],["C:\\Users\\forth\\Desktop\\metamaskclone\\metamask-extension-develop\\app\\vendor\\trezor\\content-script.js"],{})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC92ZW5kb3IvdHJlem9yL2NvbnRlbnQtc2NyaXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7RUFBRSxJQUFJLEVBQUU7QUFBaUIsQ0FBQyxDQUFDO0FBQzdELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sSUFBSTtFQUNsQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztBQUN2RCxDQUFDLENBQUM7QUFDRixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUk7RUFDL0IsSUFBSSxHQUFHLElBQUk7QUFDZixDQUFDLENBQUM7O0FBRUY7QUFDQTtBQUNBOztBQUVBLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxJQUFJO0VBQ3hDLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7SUFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQztNQUFFLElBQUksRUFBRSxLQUFLLENBQUM7SUFBSyxDQUFDLENBQUM7RUFDMUM7QUFDSixDQUFDLENBQUMiLCJmaWxlIjoiY29udGVudC1zY3JpcHQtMC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5QYXNzaW5nIG1lc3NhZ2VzIGZyb20gYmFja2dyb3VuZCBzY3JpcHQgdG8gcG9wdXBcbiovXG5cbmxldCBwb3J0ID0gY2hyb21lLnJ1bnRpbWUuY29ubmVjdCh7IG5hbWU6ICd0cmV6b3ItY29ubmVjdCcgfSk7XG5wb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihtZXNzYWdlID0+IHtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UobWVzc2FnZSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG59KTtcbnBvcnQub25EaXNjb25uZWN0LmFkZExpc3RlbmVyKGQgPT4ge1xuICAgIHBvcnQgPSBudWxsO1xufSk7XG5cbi8qXG5QYXNzaW5nIG1lc3NhZ2VzIGZyb20gcG9wdXAgdG8gYmFja2dyb3VuZCBzY3JpcHRcbiovXG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZXZlbnQgPT4ge1xuICAgIGlmIChwb3J0ICYmIGV2ZW50LnNvdXJjZSA9PT0gd2luZG93ICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgcG9ydC5wb3N0TWVzc2FnZSh7IGRhdGE6IGV2ZW50LmRhdGEgfSk7XG4gICAgfVxufSk7XG4iXSwicHJlRXhpc3RpbmdDb21tZW50IjoiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW1Gd2NDOTJaVzVrYjNJdmRISmxlbTl5TDJOdmJuUmxiblF0YzJOeWFYQjBMbXB6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3pzN096czdPenM3UVVGQlFUdEJRVU5CTzBGQlEwRTdPMEZCUlVFc1NVRkJTU3hKUVVGSkxFZEJRVWNzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNN1JVRkJSU3hKUVVGSkxFVkJRVVU3UVVGQmFVSXNRMEZCUXl4RFFVRkRPMEZCUXpkRUxFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNWMEZCVnl4RFFVRkRMRTlCUVU4c1NVRkJTVHRGUVVOc1F5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRTlCUVU4c1JVRkJSU3hOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXp0QlFVTjJSQ3hEUVVGRExFTkJRVU03UVVGRFJpeEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFbEJRVWs3UlVGREwwSXNTVUZCU1N4SFFVRkhMRWxCUVVrN1FVRkRaaXhEUVVGRExFTkJRVU03TzBGQlJVWTdRVUZEUVR0QlFVTkJPenRCUVVWQkxFMUJRVTBzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFVkJRVVVzUzBGQlN5eEpRVUZKTzBWQlEzaERMRWxCUVVrc1NVRkJTU3hKUVVGSkxFdEJRVXNzUTBGQlF5eE5RVUZOTEV0QlFVc3NUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVU3U1VGREwwTXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJRenROUVVGRkxFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTTdTVUZCU3l4RFFVRkRMRU5CUVVNN1JVRkRNVU03UVVGRFNpeERRVUZETEVOQlFVTWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4cVhHNVFZWE56YVc1bklHMWxjM05oWjJWeklHWnliMjBnWW1GamEyZHliM1Z1WkNCelkzSnBjSFFnZEc4Z2NHOXdkWEJjYmlvdlhHNWNibXhsZENCd2IzSjBJRDBnWTJoeWIyMWxMbkoxYm5ScGJXVXVZMjl1Ym1WamRDaDdJRzVoYldVNklDZDBjbVY2YjNJdFkyOXVibVZqZENjZ2ZTazdYRzV3YjNKMExtOXVUV1Z6YzJGblpTNWhaR1JNYVhOMFpXNWxjaWh0WlhOellXZGxJRDArSUh0Y2JpQWdJQ0IzYVc1a2IzY3VjRzl6ZEUxbGMzTmhaMlVvYldWemMyRm5aU3dnZDJsdVpHOTNMbXh2WTJGMGFXOXVMbTl5YVdkcGJpazdYRzU5S1R0Y2JuQnZjblF1YjI1RWFYTmpiMjV1WldOMExtRmtaRXhwYzNSbGJtVnlLR1FnUFQ0Z2UxeHVJQ0FnSUhCdmNuUWdQU0J1ZFd4c08xeHVmU2s3WEc1Y2JpOHFYRzVRWVhOemFXNW5JRzFsYzNOaFoyVnpJR1p5YjIwZ2NHOXdkWEFnZEc4Z1ltRmphMmR5YjNWdVpDQnpZM0pwY0hSY2Jpb3ZYRzVjYm5kcGJtUnZkeTVoWkdSRmRtVnVkRXhwYzNSbGJtVnlLQ2R0WlhOellXZGxKeXdnWlhabGJuUWdQVDRnZTF4dUlDQWdJR2xtSUNod2IzSjBJQ1ltSUdWMlpXNTBMbk52ZFhKalpTQTlQVDBnZDJsdVpHOTNJQ1ltSUdWMlpXNTBMbVJoZEdFcElIdGNiaUFnSUNBZ0lDQWdjRzl5ZEM1d2IzTjBUV1Z6YzJGblpTaDdJR1JoZEdFNklHVjJaVzUwTG1SaGRHRWdmU2s3WEc0Z0lDQWdmVnh1ZlNrN1hHNGlYWDA9In0=
