# Windows startup: IT8688E pump reports 0% despite an 80% curve; restarting Nexus restores 80% and increases RPM

### Nexus version

`v3.1.9-beta.1`, confirmed by the running service's `/ping` endpoint on 2026-11-08.
The executable reports file version `3.1.9`, product version `3.1.9-beta.1`.

### Operating system

Windows 11 Pro, version 26H2, build **26300.9711** (`10.0.26300`).

### What happened?

After restarting Windows, my water-cooling pump showed **0%** in telemetry while
still rotating. The pump was assigned to an unchanged **Flat curve at 80%**.
Nexus's curve engine continued reporting an 80% target, but its hardware-facing
telemetry and widget API reported 0% for the same channel.

Fully quitting Nexus and starting it again restored **80%** in both APIs.
The pump's reported tachometer speed also increased from **3154 RPM to 4017 RPM**,
without changing the curve or channel assignment. This makes an exclusively
cosmetic display problem an insufficient explanation. Startup initialization,
application of the target, or hardware readback may be involved; the root cause
has not been established.

**Expected:** after Windows startup, Nexus applies the saved pump curve once the
controller is ready and reports valid hardware feedback. Unavailable feedback
should be distinguishable from a real 0%. Internal target values should not be
interpreted as proof that hardware accepted the command.

**Potential cooling impact:** if the saved target is not actually applied, a
water-cooling pump could run below its intended speed. Please investigate the
control path as well as the display. No pump stall, overheating, or hardware damage
was established in this incident, and no independent physical PWM measurement was made.

### Hardware and driver stack

| Component | Details / evidence |
| --- | --- |
| Mainboard | Gigabyte **X570 AORUS ELITE**, confirmed through Windows CIM; rev. 1.0 according to my build information (CIM only reports `x.x`) |
| BIOS | American Megatrends **F40**, dated **2025-10-28**, read through CIM |
| CPU | AMD Ryzen 7 **5800X3D**, read through CIM |
| Motherboard fan controller | **ITE IT8688E**, identified by Nexus |
| Pump/reservoir | **Alphacool Core 140mm Reservoir D5 with VPP Apex pump**, product **13889**, confirmed by the owner |
| Pump channel | `/lpc/it8688e/0/control/2`, raw name `Fan #3`, renamed `Pumpe` in Nexus |
| Pump tachometer | `/lpc/it8688e/0/fan/2`; physical motherboard header label not independently verified |
| Flow sensor | **Barrow SLF-V3**, connected as a separate 3-pin fan tachometer, `/lpc/it8688e/0/control/1`; not the pump channel |
| Case/display | **HYTE Y70 Touch Infinite** |
| GPU | AORUS Radeon **RX 6900 XT Xtreme Waterforce WB** (build information); Windows confirms RX 6900 XT, driver **32.0.21045.16010** |
| Kernel access driver | **PawnIO 2.2.0** (`PawnIO.sys` file/product version); Windows reports driver running, start mode Manual |
| User-mode wrapper | Installed Nexus `PawnIOLib.dll`: file/product version **2.2.0** |
| Monitoring library | **LibreHardwareMonitorLib 0.9.7-pre748**, as declared by the source associated with Nexus v3.1.9-beta.1; not independently extracted from the native-AOT executable |
| Service provider | `WindowsFanControlProvider` → LibreHardwareMonitor / PawnIO → motherboard Super I/O |
| Display client | Private **Loop Flow 1.3.0** widget, built against SDK 3.1.8; only reads `cooling.state`, performs no fan/pump writes |

The configured curve is Flat, named `Pumpe`, with `flat.speed: 80`, output
`/lpc/it8688e/0/control/2`, global speed modifier `1` and channel offset `0`.
The channel reports `mode: Curve`, `controlled: true`, `readOnly: false`,
`calibrated: true`, classification `Controllable`.

### Steps to reproduce

Observed sequence on this system (reproduction frequency has not been established):

1. Have the motherboard pump channel assigned to the saved Flat 80% curve.
2. Restart Windows and let Nexus start normally.
3. Observe that the pump is rotating, but its reported duty is 0% while the saved
   curve and curve-engine output still show 80%.
4. Read the same channel through `/cooling/fans`, `cooling-realtime` and `cooling.state`;
   the discrepancy is already present in the service, independently of widget rendering.
5. Fully quit Nexus and start it again without editing the cooling configuration.
6. Observe restored 80% telemetry and an increase in reported pump RPM.

The recovery was performed by the user. No automated reboot, calibration,
profile change, or pump-control write was used during diagnosis. Windows Fast
Startup, firmware fan settings, and possible competing hardware utilities have
not been isolated as factors. No controlled series of cold boots was performed.

### Relevant measurements

These are selected fields from local, authenticated read-only API observations,
not an invented service log. Recovery was confirmed at **2026-11-08 15:51 CET**
(`14:51 UTC`). The pre-restart mismatch persisted across three consecutive
WebSocket samples; earlier single readings fluctuated slightly in RPM.

| Source / field | Faulty state | After fully restarting Nexus |
| --- | --- | --- |
| Saved curve `flat.speed` | 80 | 80 |
| `/cooling/fans`: pump `dutyPercent` | 0 | 80 |
| `/cooling/fans`: pump `rpm` | 3154 | 4017 |
| Widget `cooling.state`: pump `dutyPercent` / `rpm` | 0 / 3154 | 80 / 4017 |
| WS `cooling-curves`: `calculatedSpeed` | 80 | Not re-sampled |
| WS `cooling-curves`: `actualSpeed` | 80 | Not re-sampled |
| WS `cooling-curves`: pump output `appliedSpeed` | 80 | Not re-sampled |
| WS `cooling-realtime`: pump `speed` / `pwm` / `rpm` | 0 / 0 / 3154 | Not re-sampled |

### Relevant implementation details to investigate

At the [service commit associated with v3.1.9-beta.1](https://github.com/hello-nexus/nexus-service/tree/4bde382baf21c1c1423a365896bcfca315385e34):

- [`WindowsFanControlProvider.GetFanChannels()`](https://github.com/hello-nexus/nexus-service/blob/4bde382baf21c1c1423a365896bcfca315385e34/src/Cooling/WindowsFanControlProvider.cs)
  assigns `DutyPercent = (int)(m.ControlSensor.Value ?? 0f)`. Thus missing control
  feedback becomes indistinguishable from a real zero in these API responses.
- [`CoolingActions.cs`](https://github.com/hello-nexus/nexus-service/blob/4bde382baf21c1c1423a365896bcfca315385e34/src/Widgets/AppActions/CoolingActions.cs)
  passes the provider's channel values to widgets. The widget does not derive
  the percentage from RPM and receives no separate curve target.
- [`CurveEngine.cs`](https://github.com/hello-nexus/nexus-service/blob/4bde382baf21c1c1423a365896bcfca315385e34/src/Cooling/CurveEngine.cs)
  publishes calculated/smoothed targets as `actualSpeed` and per-output targets
  as `appliedSpeed`; those names are not an independent measurement of physical PWM.

Please check initialization/retry of motherboard control after Windows startup,
whether a target can be considered applied before the hardware is ready, and
whether absent feedback is hidden by the zero fallback. These are investigation
leads, not a confirmed root cause or a tested fix.

This report was prepared with an AI coding assistant using live read-only
measurements and a source review. No Nexus code was patched or cooling behavior
changed for the investigation. No authentication tokens, serial numbers, or
machine/user identifiers are included.
